# models/job_request_model.py
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class ElectricalJobRequest(models.Model):
    _name = 'electrical.job.request'
    _description = 'Electrical Job Request'

    first_name = fields.Char(string='First Name')
    email = fields.Char(string='Email')
    mobile = fields.Char(string='Mobile')
    postcode = fields.Char(string='Postcode')
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
    ], string='Job Type')
    customer_notes = fields.Text(string='Additional Notes')
    crm_lead_id = fields.Many2one('crm.lead', string='CRM Lead')
    property_type = fields.Selection([('house', 'House'), ('flat', 'Flat/Apartment'), ('other', 'Other')], string='Property Type')
    property_age = fields.Selection([('pre1950', 'Before 1950'), ('1950-1980', '1950-1980'), ('post1980', 'After 1980'), ('unknown', 'Not Sure')], string='Property Age')
    attic_access = fields.Selection([('yes', 'Yes'), ('no', 'No'), ('unknown', 'Not Sure')], string='Loft Access Available?')
    panel_type = fields.Selection([('breakers', 'Modern (Circuit Breakers)'), ('fuses', 'Older (Fuses)'), ('unknown', 'Not Sure')], string='Panel Type')
    recent_upgrades = fields.Char(string='Recent Electrical Upgrades')
    fuse_board_attachment_id = fields.Many2one('ir.attachment', string='Fuse Board Photo')
    water_bond = fields.Selection([('yes', 'Yes'), ('no', 'No'), ('unknown', 'Not Sure')], string='Water Bond Present?')
    water_bond_location = fields.Char(string='Water Bond Location')
    water_bond_attachment_id = fields.Many2one('ir.attachment', string='Water Bond Photo')
    gas_bond = fields.Selection([('yes', 'Yes'), ('no', 'No'), ('unknown', 'Not Sure')], string='Gas Bond Present?')
    gas_bond_location = fields.Char(string='Gas Bond Location')
    gas_bond_attachment_id = fields.Many2one('ir.attachment', string='Gas Bond Photo')
    oil_bond = fields.Selection([('yes', 'Yes'), ('no', 'No'), ('unknown', 'Not Sure')], string='Oil Bond Present?')
    oil_bond_location = fields.Char(string='Oil Bond Location')
    oil_bond_attachment_id = fields.Many2one('ir.attachment', string='Oil Bond Photo')
    other_services = fields.Selection([('yes', 'Yes'), ('no', 'No'), ('unknown', 'Not Sure')], string='Other Buried Services or Steel Work?')
    other_services_desc = fields.Text(string='Other Services Description')
    other_services_attachment_id = fields.Many2one('ir.attachment', string='Other Services Photo')
    socket_lines = fields.One2many('electrical.socket.line', 'request_id', string='Socket Details')
    attachments = fields.Many2many('ir.attachment', string='Attachments')
    # Placeholder fields from JS/controller
    socket_quantity = fields.Integer(string='Socket Quantity')
    appliance_type = fields.Char(string='Appliance Type')
    outbuilding_type = fields.Selection([('shed', 'Shed'), ('garage', 'Garage')], string='Outbuilding Type')
    ev_power_rating = fields.Char(string='EV Power Rating')
    light_location = fields.Selection([('indoor', 'Indoor'), ('outdoor', 'Outdoor')], string='Light Location')
    downlights_count = fields.Integer(string='Downlights Count')
    smart_compatibility = fields.Char(string='Smart Compatibility')
    motion_sensor = fields.Selection([('yes', 'Yes'), ('no', 'No')], string='Motion Sensor')
    dimmer_count = fields.Integer(string='Dimmer Count')
    current_unit_type = fields.Char(string='Current Unit Type')
    rccb_circuit = fields.Char(string='RCCB Circuit')
    surge_scope = fields.Selection([('whole', 'Whole House'), ('specific', 'Specific Devices')], string='Surge Scope')
    property_size = fields.Char(string='Property Size')
    alarms_count = fields.Integer(string='Alarms Count')
    bonding_status = fields.Char(string='Bonding Status')
    last_test_date = fields.Date(string='Last Test Date')
    emergency_type = fields.Selection([('commercial', 'Commercial'), ('residential', 'Residential')], string='Emergency Type')
    rooms_count = fields.Integer(string='Rooms Count')
    partial_rooms = fields.Char(string='Partial Rooms')
    trunking_length = fields.Float(string='Trunking Length')
    facility_size = fields.Char(string='Facility Size')
    minor_description = fields.Text(string='Minor Description')
    fault_symptoms = fields.Text(string='Fault Symptoms')
    cable_type = fields.Char(string='Cable Type')
    ethernet_points = fields.Integer(string='Ethernet Points')
    coverage_area = fields.Char(string='Coverage Area')
    shower_power = fields.Char(string='Shower Power')
    heating_area = fields.Float(string='Heating Area')
    thermostat_type = fields.Char(string='Thermostat Type')
    integration_platform = fields.Char(string='Integration Platform')
    hub_brand = fields.Char(string='Hub Brand')
    knx_devices = fields.Integer(string='KNX Devices')
    panel_location = fields.Char(string='Panel Location')
    doors_count = fields.Integer(string='Doors Count')
    cameras_count = fields.Integer(string='Cameras Count')
    gate_type = fields.Char(string='Gate Type')
    lighting_bonding = fields.Char(string='Lighting Bonding')
    smart_systems = fields.Char(string='Smart Systems')
    ceiling_type = fields.Char(string='Ceiling Type')

class ElectricalSocketLine(models.Model):
    _name = 'electrical.socket.line'
    _description = 'Electrical Socket Line'

    request_id = fields.Many2one('electrical.job.request', string='Job Request')
    room_name = fields.Char(string='Room Name')
    socket_style = fields.Selection([('standard', 'Standard'), ('usb', 'USB Integrated'), ('smart', 'Smart Socket')], string='Socket Style')
    height_from_floor = fields.Float(string='Height from Floor (m)')
    mount_type = fields.Selection([('surface', 'Surface (on wall)'), ('flush', 'Flush (in wall)')], string='Mount Type')
    flooring_type = fields.Selection([('carpet', 'Carpet'), ('laminate', 'Laminate'), ('tile', 'Tile'), ('wood', 'Wood'), ('other', 'Other')], string='Flooring Type')
    flooring_other = fields.Char(string='Other Flooring')
    wall_type = fields.Selection([('plasterboard', 'Plasterboard/Drywall'), ('brick', 'Brick/Concrete'), ('tiled', 'Tiled Wall'), ('glass_splashback', 'Glass Splashback'), ('metal_splashback', 'Metal Splashback'), ('cladding', 'Cladding'), ('other', 'Other/Not Sure')], string='Wall Type')
    gangs = fields.Selection([('single', 'Single'), ('double', 'Double'), ('triple', 'Triple')], string='Number of Gangs')
    socket_comments = fields.Text(string='Additional Comments')
    location_attachments = fields.Many2many('ir.attachment', 'socket_location_attachment_rel', 'socket_id', 'attachment_id', string='Location Attachments')
    route_attachments = fields.Many2many('ir.attachment', 'socket_route_attachment_rel', 'socket_id', 'attachment_id', string='Route Attachments')




class Attachment(models.Model):
    _inherit = 'ir.attachment'

    s3_key = fields.Char(string='S3 Key', help='Key of the file in S3 storage')