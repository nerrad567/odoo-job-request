# odoo_job_request/__manifest__.py
{
    "name": "Odoo Job Request Portal",
    "version": "1.4.0",  # Bumped for JSON refactor/compatibility updates
    "summary": "Public job request portal for services",
    "category": "Website/CRM",
    "author": "Gray Logic",
    "license": "LGPL-3",
    "depends": ["website", "crm", "portal", "web"],
    "external_dependencies": {"python": ["boto3"]},
    "data": [
        "security/ir.model.access.csv",
        "security/ir_rule.xml",
        "views/job_request.xml",
        "data/partial_expiry_cron.xml",
        "data/config_parameters.xml",
    ],
    "assets": {
        "web.assets_frontend": [ 
            "odoo_job_request/static/src/js/templates/form_steps.xml.js",
            "odoo_job_request/static/src/js/utils/file_utils.js",
            "odoo_job_request/static/src/js/constants.js",
            "odoo_job_request/static/src/js/state/initialFormState.js",
            "odoo_job_request/static/src/js/templates/basic_info_step.xml.js",
            "odoo_job_request/static/src/js/templates/bonding_grounding_step.xml.js",
            "odoo_job_request/static/src/js/templates/fuse_board_step.xml.js",
            "odoo_job_request/static/src/js/templates/socket_details_step.xml.js",
            "odoo_job_request/static/src/js/templates/additional_notes_step.xml.js",
            "odoo_job_request/static/src/js/templates/ev_charger_step.xml.js",
            "odoo_job_request/static/src/js/templates/form_steps.xml.js",
            "odoo_job_request/static/src/js/utils/resumeUtils.js",
            "odoo_job_request/static/src/js/utils/socketUtils.js",
            "odoo_job_request/static/src/js/utils/formUtils.js",
            "odoo_job_request/static/src/js/utils/submitUtils.js",
            "odoo_job_request/static/src/js/components/JobRequestForm.js",
            "odoo_job_request/static/src/js/components/JobRequestForm.js",
            
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}