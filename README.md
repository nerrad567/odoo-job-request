# 🛠️ Odoo Job Request Portal

A custom Odoo 18 module that provides a **public-facing electrical job request form**, integrated with CRM and file upload capabilities (via Hetzner S3). Designed to streamline the intake, classification, and handling of customer electrical work enquiries.

---

## 🚀 Features

- ✅ Multi-step public job request form (OWL 2 + Bootstrap)
- ✅ Dynamic socket data capture with per-socket details
- ✅ File uploads (photos, PDFs, videos) linked to CRM leads
- ✅ S3-based attachment storage (Hetzner-compatible)
- ✅ Admin/staff views for structured job data in CRM
- ✅ Bonding, property, and electrical metadata collection

---

## 🧠 Architecture

- **Frontend**: OWL 2 component mounted in a `website.layout` template
- **Backend**: Controllers + ORM models for lead and attachment creation
- **Storage**: Presigned S3 upload (via boto3) with parameterized config
- **Security**: Domain filters on attachments, `ir.model.access.csv` + `ir.rule`

---

## ⚙️ Requirements

- Odoo 18.0+
- Python 3.10+
- `boto3` (install with `pip install boto3`)
- Hetzner object storage bucket + access key

---

## 🔧 Configuration

Set the following `ir.config_parameter` keys in the database:

| Key                          | Example                          |
|-----------------------------|----------------------------------|
| `hetzner_access_key_id`     | `AKIA...`                        |
| `hetzner_secret_access_key` | `s3cr3t...`                      |
| `hetzner_bucket`            | `electrical-job-portal-fsn1`     |
| `hetzner_region`            | `fsn1`                           |

These are typically injected via a post-deploy script or the Odoo UI (Settings → Technical → System Parameters).

---

