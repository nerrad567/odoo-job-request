#!/usr/bin/env bash
###############################################################################
# Odoo-docker one-module redeploy / wipe script  – “zero-trace” version
###############################################################################
set -euo pipefail

# ───────── CONFIG ─────────
MODULE="odoo_job_request"               # default target; override with --module
DB="odoo"
ODOO_CONT="odoo-dev"
PGHOST="postgres-dev"; PGPORT=5432; PGPASS="odoo"
COMPOSE_FILE="$HOME/odoo-dev/docker-compose.yml"
LOGLEVEL="debug"
# ──────────────────────────

# ───── CLI flags ─────
WIPE=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --wipe|--uninstall-only) WIPE=true ;;
    --module)                MODULE="$2"; shift ;;
    --log-level)             LOGLEVEL="$2"; shift ;;
    *) echo "Unknown option $1"; exit 1 ;;
  esac
  shift
done

echo "◼︎ Module    : $MODULE"
echo "◼︎ Wipe mode : $WIPE"
echo "◼︎ Log level : $LOGLEVEL"
sleep 1

# helpers
psql() {
  docker exec -e PGPASSWORD="$PGPASS" -i "$ODOO_CONT" \
    psql -At -U odoo -d "$DB" -h "$PGHOST" -p "$PGPORT" "$@"
}
odoo_cmd() {
  docker exec -i "$ODOO_CONT" odoo \
    --db_host="$PGHOST" --db_port="$PGPORT" \
    --db_user=odoo --db_password="$PGPASS" \
    --log-level="$LOGLEVEL" "$@" 2>&1 | awk 'tolower($0) ~ / info / {next} {print}'
}

# 1️⃣  Clear old asset bundles
echo "🧹  Clearing cached asset bundles…"
psql -c "DELETE FROM ir_attachment WHERE name LIKE '%assets_%';"



# 2️⃣  Wipe branch
if $WIPE; then
  echo "🚮  Fully wiping $MODULE …"
  psql <<SQL
BEGIN;

-- mark uninstalled
UPDATE ir_module_module SET state='uninstalled' WHERE name='$MODULE';

------------------------------------------------------------------
-- 1. Drop tables *exclusively* owned by the module
------------------------------------------------------------------
DO \$\$
DECLARE rec RECORD; owners INT; tbl TEXT;
BEGIN
  FOR rec IN
      SELECT m.id, m.model
      FROM   ir_model m
      JOIN   ir_model_data d ON d.model='ir.model' AND d.res_id=m.id
      WHERE  d.module = '$MODULE'
  LOOP
      SELECT COUNT(DISTINCT module) INTO owners
        FROM ir_model_data
        WHERE model='ir.model' AND res_id = rec.id;

      IF owners = 1 THEN
        tbl := replace(rec.model, '.', '_');
        IF EXISTS (SELECT 1 FROM pg_class WHERE relname = tbl) THEN
          EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', tbl);
        END IF;
      END IF;
  END LOOP;
END;\$\$ LANGUAGE plpgsql;

------------------------------------------------------------------
-- 2. Drop every column the module added to shared tables
------------------------------------------------------------------
DO \$\$
DECLARE rec RECORD; tbl TEXT; other INT;
BEGIN
  FOR rec IN
      SELECT f.id AS fid, f.model, f.name
      FROM   ir_model_fields f
      JOIN   ir_model_data  d ON d.model='ir.model.fields' AND d.res_id=f.id
      WHERE  d.module = '$MODULE'
  LOOP
      SELECT COUNT(*) INTO other
        FROM ir_model_data
        WHERE model='ir.model.fields' AND res_id=rec.fid AND module <> '$MODULE';

      IF other = 0 THEN           -- safe to drop column + metadata
        tbl := replace(rec.model, '.', '_');
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = tbl AND column_name = rec.name) THEN
          EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS %I CASCADE',
                         tbl, rec.name);
        END IF;
        DELETE FROM ir_model_fields WHERE id = rec.fid;
      END IF;
  END LOOP;
END;\$\$ LANGUAGE plpgsql;

------------------------------------------------------------------
-- 3. Remove views, menus, actions, ACLs, and XML-IDs of the module
------------------------------------------------------------------
DELETE FROM ir_ui_view
  WHERE id IN (SELECT res_id FROM ir_model_data
               WHERE module='$MODULE' AND model='ir.ui.view');
DELETE FROM ir_ui_menu
  WHERE id IN (SELECT res_id FROM ir_model_data
               WHERE module='$MODULE' AND model='ir.ui.menu');
DELETE FROM ir_model_access
  WHERE id IN (SELECT res_id FROM ir_model_data
               WHERE module='$MODULE' AND model='ir.model.access');

-- Actions table exists only in Enterprise
DO \$\$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname='ir_actions_act_window') THEN
    DELETE FROM ir_actions_act_window
      WHERE id IN (SELECT res_id FROM ir_model_data
                   WHERE module='$MODULE' AND model='ir.actions.act_window');
  END IF;
END;\$\$ LANGUAGE plpgsql;

-- finally remove ALL ir_model_data rows of the module
DELETE FROM ir_model_data WHERE module = '$MODULE';

-- purge bundles once more (safety)
DELETE FROM ir_attachment WHERE name LIKE '%assets_%';

COMMIT;
SQL

  echo "🛠  Rebuilding core registry …"
  odoo_cmd -d "$DB" -u base --stop-after-init
  echo "✔️  $MODULE wiped; zero DB trace left."

# 3️⃣  Install / upgrade
else
  INSTALLED=$(psql -c "SELECT state FROM ir_module_module WHERE name='$MODULE';")
  if [[ "$INSTALLED" == "installed" ]]; then
    echo "🔄  Upgrading $MODULE …"
    odoo_cmd -d "$DB" -u "$MODULE" --stop-after-init
  else
    echo "➕  Installing $MODULE …"
    odoo_cmd -d "$DB" -i "$MODULE" --stop-after-init --dev=all
  fi
fi

# 4️⃣  Restart stack
echo "🔃 Restarting docker stack …"
docker compose -f "$COMPOSE_FILE" restart
echo "✅  Done."
