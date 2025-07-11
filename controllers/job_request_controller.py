from odoo import http
from odoo.http import request
import logging
import boto3
from botocore.exceptions import ClientError
from botocore.client import Config
import uuid
from datetime import datetime

_logger = logging.getLogger(__name__)

class JobRequestController(http.Controller):

    def _get_s3_client(self):
        """Initialize S3 client for Hetzner Object Storage."""
        access_key = request.env['ir.config_parameter'].sudo().get_param('hetzner_access_key_id')
        secret_key = request.env['ir.config_parameter'].sudo().get_param('hetzner_secret_access_key')
        region = request.env['ir.config_parameter'].sudo().get_param('hetzner_region', 'fsn1')
        if not access_key or not secret_key:
            raise ValueError('Hetzner S3 credentials not configured.')
        return boto3.client(
            's3',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            endpoint_url=f'https://{region}.your-objectstorage.com',
            config=Config(signature_version='s3v4')
        )

    @http.route('/job-request/presigned-url', type='json', auth='public', website=True, methods=['POST'], csrf=False)
    def get_presigned_url(self, file_name, file_type):
        """Generate presigned URL for direct S3 upload."""
        try:
            s3 = self._get_s3_client()
            bucket = request.env['ir.config_parameter'].sudo().get_param('hetzner_bucket', 'electrical-job-portal-fsn1')
            unique_id = str(uuid.uuid4())
            file_ext = '.' + file_name.split('.')[-1] if '.' in file_name else ''
            s3_key = f"job-requests/{unique_id}{file_ext}"

            presigned_url = s3.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': bucket,
                    'Key': s3_key,
                    'ContentType': file_type
                },
                ExpiresIn=3600  # 1 hour expiry
            )
            return {
                'status': 'success',
                'data': {
                    'url': presigned_url,
                    's3_key': s3_key,
                    'bucket': bucket
                }
            }
        except ClientError as e:
            _logger.error("Presigned URL error: %s", str(e))
            return {'status': 'error', 'message': str(e)}

    @http.route('/job-request', type='http', auth='public', website=True)
    def job_request_form(self, **kwargs):
        """Render the form template (GET)."""
        _logger.debug("Rendering job request form")
        return request.render('electrical_job_request.job_request_form')

    @http.route('/job-request/submit', type='json', auth='public', website=True, methods=['POST'], csrf=False)
    def job_request_submit(self, **data):
        """Handle form submission (JSON POST). Attachments are metadata only."""
        try:
            first_name = data.get('first_name', '').strip()
            email = data.get('email', '').strip()
            mobile = data.get('mobile', '').strip()
            postcode = data.get('postcode', '').strip()
            job_type = data.get('job_type', '')
            customer_notes = data.get('customer_notes', '')

            if not first_name or not email or not job_type:
                return {'status': 'error', 'message': 'Missing required fields: first_name, email, job type.'}

            # Create CRM Lead
            lead_vals = {
                'name': f"Electrical Job Request - {first_name}",
                'partner_name': first_name,
                'email_from': email,
                'phone': mobile,
                'description': customer_notes,
                'type': 'lead',
            }
            lead = request.env['crm.lead'].sudo().create(lead_vals)  # sudo() ok for public creation, but monitor

            # Prepare Job Request vals including socket_lines create commands
            job_request_vals = {
                'first_name': first_name,
                'email': email,
                'mobile': mobile,
                'postcode': postcode,
                'job_type': job_type,
                'customer_notes': customer_notes,
                'crm_lead_id': lead.id,
                'property_type': data.get('property_type'),
                'property_age': data.get('property_age'),
                'attic_access': data.get('attic_access'),
                'panel_type': data.get('panel_type'),
                'recent_upgrades': data.get('recent_upgrades'),
                'water_bond': data.get('water_bond'),
                'water_bond_location': data.get('water_bond_location') if data.get('water_bond') == 'yes' else False,
                'gas_bond': data.get('gas_bond'),
                'gas_bond_location': data.get('gas_bond_location') if data.get('gas_bond') == 'yes' else False,
                'oil_bond': data.get('oil_bond'),
                'oil_bond_location': data.get('oil_bond_location') if data.get('oil_bond') == 'yes' else False,
                'other_services': data.get('other_services'),
                'other_services_desc': data.get('other_services_desc') if data.get('other_services') == 'yes' else False,
            }

            # Add placeholder fields that exist in the model
            job_request_vals.update({
                'socket_quantity': int(data.get('socket_quantity') or 0),
                'appliance_type': data.get('appliance_type'),
                'outbuilding_type': data.get('outbuilding_type'),
                'ev_power_rating': data.get('ev_power_rating'),
                'light_location': data.get('light_location'),
                'downlights_count': int(data.get('downlights_count') or 0),
                'smart_compatibility': data.get('smart_compatibility'),
                'motion_sensor': data.get('motion_sensor'),
                'dimmer_count': int(data.get('dimmer_count') or 0),
                'current_unit_type': data.get('current_unit_type'),
                'rccb_circuit': data.get('rccb_circuit'),
                'surge_scope': data.get('surge_scope'),
                'property_size': data.get('property_size'),
                'alarms_count': int(data.get('alarms_count') or 0),
                'bonding_status': data.get('bonding_status'),
                'last_test_date': data.get('last_test_date') if data.get('last_test_date') else False,
                'emergency_type': data.get('emergency_type'),
                'rooms_count': int(data.get('rooms_count') or 0),
                'partial_rooms': data.get('partial_rooms'),
                'trunking_length': float(data.get('trunking_length') or 0.0),
                'facility_size': data.get('facility_size'),
                'minor_description': data.get('minor_description'),
                'fault_symptoms': data.get('fault_symptoms'),
                'cable_type': data.get('cable_type'),
                'ethernet_points': int(data.get('ethernet_points') or 0),
                'coverage_area': data.get('coverage_area'),
                'shower_power': data.get('shower_power'),
                'heating_area': float(data.get('heating_area') or 0.0),
                'thermostat_type': data.get('thermostat_type'),
                'integration_platform': data.get('integration_platform'),
                'hub_brand': data.get('hub_brand'),
                'knx_devices': int(data.get('knx_devices') or 0),
                'panel_location': data.get('panel_location'),
                'doors_count': int(data.get('doors_count') or 0),
                'cameras_count': int(data.get('cameras_count') or 0),
                'gate_type': data.get('gate_type'),
                'lighting_bonding': data.get('lighting_bonding'),
                'smart_systems': data.get('smart_systems'),
                'ceiling_type': data.get('ceiling_type'),
            })

            socket_lines_cmds = []
            if job_type == 'new_socket' and data.get('socket_lines'):
                valid_styles = ['standard', 'usb', 'smart']
                for line in data.get('socket_lines', []):
                    if line.get('room_name'):
                        socket_lines_cmds.append((0, 0, {
                            'room_name': line['room_name'].strip(),
                            'socket_style': line['socket_style'] if line['socket_style'] in valid_styles else 'standard',
                            'height_from_floor': float(line.get('height_from_floor', 0.0)),
                            'mount_type': line.get('mount_type'),
                            'flooring_type': line.get('flooring_type'),
                            'flooring_other': line.get('flooring_other') if line.get('flooring_type') == 'other' else False,
                            'wall_type': line.get('wall_type'),
                            'gangs': line.get('gangs'),
                            'socket_comments': line.get('socket_comments', ''),
                        }))

            job_request_vals['socket_lines'] = socket_lines_cmds

            # Create the single Job Request record
            job_request = request.env['electrical.job.request'].sudo().create(job_request_vals)

            # Handle Header Attachment Metadata
            fuse_board = data.get('fuse_board_attachment')
            if fuse_board:
                att_id = self._create_attachment(fuse_board, 'electrical.job.request', job_request.id)
                job_request.sudo().write({'fuse_board_attachment_id': att_id})

            water_bond_att = data.get('water_bond_attachment')
            if water_bond_att and data.get('water_bond') == 'yes':
                att_id = self._create_attachment(water_bond_att, 'electrical.job.request', job_request.id)
                job_request.sudo().write({'water_bond_attachment_id': att_id})

            gas_bond_att = data.get('gas_bond_attachment')
            if gas_bond_att and data.get('gas_bond') == 'yes':
                att_id = self._create_attachment(gas_bond_att, 'electrical.job.request', job_request.id)
                job_request.sudo().write({'gas_bond_attachment_id': att_id})

            oil_bond_att = data.get('oil_bond_attachment')
            if oil_bond_att and data.get('oil_bond') == 'yes':
                att_id = self._create_attachment(oil_bond_att, 'electrical.job.request', job_request.id)
                job_request.sudo().write({'oil_bond_attachment_id': att_id})

            other_services_att = data.get('other_services_attachment')
            if other_services_att and data.get('other_services') == 'yes':
                att_id = self._create_attachment(other_services_att, 'electrical.job.request', job_request.id)
                job_request.sudo().write({'other_services_attachment_id': att_id})

            # Handle per-socket attachments (now that socket_lines have IDs)
            for idx, socket_line in enumerate(job_request.socket_lines):
                line_data = data.get('socket_lines', [])[idx]
                location_ids = []
                for att in line_data.get('location_attachments', []):
                    att_id = self._create_attachment(att, 'electrical.socket.line', socket_line.id)
                    location_ids.append(att_id)
                if location_ids:
                    socket_line.sudo().write({'location_attachments': [(6, 0, location_ids)]})
                route_ids = []
                for att in line_data.get('route_attachments', []):
                    att_id = self._create_attachment(att, 'electrical.socket.line', socket_line.id)
                    route_ids.append(att_id)
                if route_ids:
                    socket_line.sudo().write({'route_attachments': [(6, 0, route_ids)]})

            # Handle general attachments
            attachment_ids = []
            for att in data.get('attachments', []):
                att_id = self._create_attachment(att, 'electrical.job.request', job_request.id)
                attachment_ids.append(att_id)
            if attachment_ids:
                job_request.sudo().write({'attachments': [(6, 0, attachment_ids)]})

            return {'status': 'success', 'message': 'Job request submitted successfully.'}
        except Exception as e:
            _logger.error("Submission error: %s", str(e))
            return {'status': 'error', 'message': f'Server error: {str(e)}'}

    def _create_attachment(self, metadata, res_model, res_id, res_field=False):
        if not metadata:
            return False
        att_vals = {
            'name': metadata.get('name', ''),
            'res_model': res_model,
            'res_id': res_id,
            'type': 'url',
            'url': '',
            's3_key': metadata.get('s3_key', ''),
            'mimetype': metadata.get('type', 'application/octet-stream'),
            'public': False,
        }
        if res_field:
            att_vals['res_field'] = res_field
        attachment = request.env['ir.attachment'].sudo().create(att_vals)
        attachment.sudo().write({'url': f'/attachments/download/{attachment.id}'})
        return attachment.id

    @http.route('/job-request/thank-you', type='http', auth='public', website=True)
    def job_request_thank_you(self, **kwargs):
        """Render thank-you page."""
        return request.render('electrical_job_request.job_request_thank_you')