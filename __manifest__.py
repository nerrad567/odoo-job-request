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
            "odoo_job_request/static/src/js/utils/validation_utils.js",
            "odoo_job_request/static/src/js/utils/file_utils.js",
            "odoo_job_request/static/src/js/constants.js",
            "odoo_job_request/static/src/js/components/JobRequestForm.js",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}