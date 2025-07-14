# electrical_job_request/models/job_request_model.py

from odoo import models, fields, api, _
from odoo.fields import Datetime
from dateutil.relativedelta import relativedelta
import json
import uuid
from odoo.exceptions import ValidationError  # For constraint error

class CrmLead(models.Model):
    _inherit = 'crm.lead'

    job_request_ids = fields.One2many('electrical.job.request', 'crm_lead_id', string='Job Requests')

class ElectricalJobRequest(models.Model):
    _name = 'electrical.job.request'
    _description = 'Electrical Job Request'

    name = fields.Char(string='Name', compute='_compute_name', store=True)  # Added: Computed name for UI (medium: Improves list views/search)
    crm_lead_id = fields.Many2one('crm.lead', string='CRM Lead', index=True, required=False)  # Change: required=False (high: Allows partials without lead)
    job_type = fields.Selection([
        ('new_socket', 'New Socket Installation'),
        ('additional_circuit', 'Additional Circuit Installation'),
        ('outbuilding_power', 'Outbuilding Power Supply'),
        ('ev_charger', 'EV Charger Installation'),
        ('new_light', 'New Light Installation'),
        ('downlights', 'Downlights / Spotlights'),
        ('smart_lighting', 'Smart Lighting Systems'),
        ('outdoor_lighting', 'Outdoor & Security Lighting'),
        ('dimmer_install', 'Dimmer Switch Installation'),
        ('consumer_unit', 'Consumer Unit / Fusebox Upgrade'),
        ('rccb_install', 'RCD / RCBO Installation'),
        ('surge_protection', 'Surge Protection Devices'),
        ('eicr', 'EICR / Safety Report'),
        ('smoke_alarms', 'Smoke & Heat Alarm Installation'),
        ('earthing_bonding', 'Main Earthing & Bonding'),
        ('fixed_wire_testing', 'Fixed Wire Testing'),
        ('emergency_lighting', 'Emergency Lighting'),
        ('full_rewire', 'Full Rewire'),
        ('partial_rewire', 'Partial Rewire'),
        ('dado_trunking', 'Dado Trunking'),
        ('industrial_rewire', 'Industrial & Commercial Rewire'),
        ('minor_works', 'Minor Electrical Works'),
        ('fault_finding', 'Fault Finding & Troubleshooting'),
        ('structured_cabling', 'Structured & Data Cabling'),
        ('ethernet_point', 'Ethernet Point Installation'),
        ('wifi_booster', 'Wi-Fi Extender / Mesh Node'),
        ('electric_shower', 'Electric Shower Installation'),
        ('underfloor_heating', 'Underfloor Heating Wiring'),
        ('heating_controls', 'Heating System Controls Installation'),
        ('smart_heating_controls', 'Smart Heating Controls Integration'),
        ('smart_hub', 'Smart Home Hub Integration'),
        ('knx_system', 'KNX Automation System'),
        ('home_automation_panel', 'Automation Control Panel'),
        ('access_control', 'Access Control & Door Entry'),
        ('cctv', 'CCTV & Security Systems'),
        ('automated_gates', 'Automated Gates & Barriers'),
    ], string='Job Type', required=False, tracking=True)  # Added tracking (low: Logs changes for mail/activity)
    
    # All details in JSON (notes now in relevant sections, e.g., misc.comments)
    job_specifics = fields.Text(string='Job Specifics', help='JSON for all form-collected details')
    
    # Attachments M2M (referenced in JSON)
    attachments = fields.Many2many('ir.attachment', string='Attachments')

    # Resume features
    resume_code = fields.Char(string='Resume Code', index=True, copy=False, help='Code for resuming partial submissions')
    is_partial = fields.Boolean(string='Is Partial', default=True, help='Flag for incomplete submissions')

    @api.depends('job_type', 'crm_lead_id')
    def _compute_name(self):
        for record in self:
            if record.crm_lead_id:
                record.name = f"Job Request {record.job_type} for Lead {record.crm_lead_id.name}"
            else:
                record.name = f"Partial Job Request {record.job_type or 'Untitled'}"

    def generate_resume_code(self):
        return str(uuid.uuid4())[:8].upper()  # Change: Instance method (why: Called on record, e.g., job_request.generate_resume_code())

    @api.constrains('resume_code')
    def _check_unique_resume_code(self):
        for record in self:
            if record.resume_code and self.search_count([('resume_code', '=', record.resume_code), ('id', '!=', record.id)]) > 0:
                raise ValidationError(_('Resume code must be unique.'))

    @api.constrains('job_specifics')
    def _check_json_valid(self):
        for record in self:
            if record.job_specifics:
                try:
                    json.loads(record.job_specifics)
                except ValueError:
                    raise ValidationError(_('Job specifics must be valid JSON.'))

    @api.model
    def _cron_expire_partials(self):
        expired = self.search([('is_partial', '=', True), ('create_date', '<', Datetime.now() - relativedelta(days=7))])
        expired.unlink()  # Or archive

class Attachment(models.Model):
    _inherit = 'ir.attachment'
    s3_key = fields.Char(string='S3 Key', index=True)  # Added index (low: If searching by key—speeds queries)