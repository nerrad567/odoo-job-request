# models/job_request_model.py
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class ElectricalJobRequest(models.Model):
    _name = 'electrical.job.request'
    _description = 'Electrical Job Request'
    _order = 'create_date desc'

    name = fields.Char(string='Customer Name', required=True)
    email = fields.Char(string='Email', required=True)
    phone = fields.Char(string='Phone')
    job_type = fields.Selection([
        ('new_socket', 'New Socket'),
    ], string='Job Type', required=True, default='new_socket')
    customer_notes = fields.Text(string='Customer Notes')
    socket_lines = fields.One2many(
        'electrical.socket.line', 'job_request_id', string='Socket Lines'
    )
    attachments = fields.One2many(
        'ir.attachment', 'res_id', string='Attachments',
        domain=[('res_model', '=', 'electrical.job.request')]
    )
    crm_lead_id = fields.Many2one('crm.lead', string='CRM Lead', index=True)

    # New Header Fields
    property_type = fields.Selection([
        ('house', 'House'),
        ('flat', 'Flat/Apartment'),
        ('other', 'Other'),
    ], string='Property Type', required=True)
    property_age = fields.Selection([
        ('pre1950', 'Before 1950'),
        ('1950-1980', '1950-1980'),
        ('post1980', 'After 1980'),
        ('unknown', 'Not Sure'),
    ], string='Property Age', required=True)
    foundation_type = fields.Selection([
        ('slab', 'Slab (no crawlspace)'),
        ('crawl', 'Crawlspace'),
        ('other', 'Other/Not Sure'),
    ], string='Foundation Type')
    attic_access = fields.Selection([
        ('yes', 'Yes'),
        ('no', 'No'),
        ('unknown', 'Not Sure'),
    ], string='Attic Access')
    panel_type = fields.Selection([
        ('breakers', 'Modern (Circuit Breakers)'),
        ('fuses', 'Older (Fuses)'),
        ('unknown', 'Not Sure'),
    ], string='Panel Type')
    recent_upgrades = fields.Char(string='Recent Upgrades')
    fuse_board_attachment_id = fields.Many2one('ir.attachment', string='Fuse Board Photo')

    # Bonding Fields
    water_bond = fields.Selection([
        ('yes', 'Yes'),
        ('no', 'No'),
        ('unknown', 'Not Sure'),
    ], string='Water Bond Present', default='no')
    water_bond_location = fields.Char(string='Water Bond Location')
    water_bond_attachment_id = fields.Many2one('ir.attachment', string='Water Bond Photo')

    gas_bond = fields.Selection([
        ('yes', 'Yes'),
        ('no', 'No'),
        ('unknown', 'Not Sure'),
    ], string='Gas Bond Present', default='no')
    gas_bond_location = fields.Char(string='Gas Bond Location')
    gas_bond_attachment_id = fields.Many2one('ir.attachment', string='Gas Bond Photo')

    oil_bond = fields.Selection([
        ('yes', 'Yes'),
        ('no', 'No'),
        ('unknown', 'Not Sure'),
    ], string='Oil Bond Present', default='no')
    oil_bond_location = fields.Char(string='Oil Bond Location')
    oil_bond_attachment_id = fields.Many2one('ir.attachment', string='Oil Bond Photo')

    other_services = fields.Selection([
        ('yes', 'Yes'),
        ('no', 'No'),
        ('unknown', 'Not Sure'),
    ], string='Other Buried Services', default='no')
    other_services_desc = fields.Text(string='Other Services Description')
    other_services_attachment_id = fields.Many2one('ir.attachment', string='Other Services Photo')

    @api.constrains('socket_lines')
    def _check_socket_lines(self):
        for record in self:
            if record.job_type == 'new_socket' and not record.socket_lines:
                raise ValidationError(_("At least one socket line is required for 'New Socket' jobs."))





class ElectricalSocketLine(models.Model):
    _name = 'electrical.socket.line'
    _description = 'Electrical Socket Line'

    job_request_id = fields.Many2one('electrical.job.request', string='Job Request', required=True, index=True, ondelete='cascade')    
    room_name = fields.Char(string="Room Name", required=True)
    socket_style = fields.Selection([
        ('standard', 'Standard'),
        ('usb', 'USB Integrated'),
        ('smart', 'Smart Socket')
    ], string="Socket Style", required=True, default='standard')
    height_from_floor = fields.Float(string="Height from Floor (m)", required=True)
    mount_type = fields.Selection([
        ('surface', 'Surface (on wall)'),
        ('flush', 'Flush (in wall)')
    ], string="Surface or Flush Mounted?", required=True)
    flooring_type = fields.Selection([
        ('carpet', 'Carpet'),
        ('laminate', 'Laminate'),
        ('tile', 'Tile'),
        ('wood', 'Wood'),
        ('other', 'Other')
    ], string="Flooring Type", required=True)
    flooring_other = fields.Char(string="Other Flooring Description")
    wall_type = fields.Selection([
        ('plasterboard', 'Plasterboard/Drywall'),
        ('brick', 'Brick/Concrete'),
        ('tiled', 'Tiled Wall'),
        ('glass_splashback', 'Glass Splashback'),
        ('metal_splashback', 'Metal Splashback'),
        ('cladding', 'Cladding'),
        ('other', 'Other/Not Sure')
    ], string="Wall Type")
    gangs = fields.Selection([
        ('single', 'Single'),
        ('double', 'Double'),
        ('triple', 'Triple')
    ], string="Number of Gangs")
    location_attachments = fields.One2many('ir.attachment', 'res_id', string='Location Attachments', domain=[('res_model', '=', 'electrical.socket.line'), ('res_field', '=', 'location_attachments')])
    route_attachments = fields.One2many('ir.attachment', 'res_id', string='Route Attachments', domain=[('res_model', '=', 'electrical.socket.line'), ('res_field', '=', 'route_attachments')])
    socket_comments = fields.Text(string="Additional Comments") 




class Attachment(models.Model):
    _inherit = 'ir.attachment'

    s3_key = fields.Char(string='S3 Key', help='Key of the file in S3 storage')