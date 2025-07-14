# electrical_job_request/__manifest__.py
{
    "name": "Electrical Job Request Portal",
    "version": "1.4.0",  # Bumped for JSON refactor/compatibility updates
    "summary": "Public job request portal for electrical services",
    "category": "Website/CRM",
    "author": "Gray Logic",
    "license": "LGPL-3",
    "depends": ["website", "crm", "portal", "web"],
    "external_dependencies": {"python": ["boto3"]},
    "data": [
        "security/ir.model.access.csv",
        "security/ir_rule.xml",
        "views/electrical_job_request.xml",
        "data/partial_expiry_cron.xml",
        "data/config_parameters.xml",
    ],
    "assets": {
        "web.assets_frontend": [
            "electrical_job_request/static/src/js/validation_utils.js",
            "electrical_job_request/static/src/js/file_utils.js",
            "electrical_job_request/static/src/js/form_steps.js",
            "electrical_job_request/static/src/js/job_request_form.js",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}