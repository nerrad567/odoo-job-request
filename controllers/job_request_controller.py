from odoo import http
from odoo.http import request
import logging
import boto3
from botocore.exceptions import ClientError
from botocore.client import Config
import uuid

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
            name = data.get('name', '').strip()
            email = data.get('email', '').strip()
            phone = data.get('phone', '').strip()
            job_type = data.get('job_type', '')
            customer_notes = data.get('customer_notes', '')

            if not name or not email or not job_type:
                return {'status': 'error', 'message': 'Missing required fields: name, email, job type.'}

            # Create CRM Lead
            lead_vals = {
                'name': f"Electrical Job Request - {name}",
                'partner_name': name,
                'email_from': email,
                'phone': phone,
                'description': customer_notes,
                'type': 'lead',
            }
            lead = request.env['crm.lead'].sudo().create(lead_vals)  # sudo() ok for public creation, but monitor

            # Prepare Job Request vals including socket_lines create commands
            job_request_vals = {
                'name': name,
                'email': email,
                'phone': phone,
                'job_type': job_type,
                'customer_notes': customer_notes,
                'crm_lead_id': lead.id,
                'property_type': data.get('property_type'),
                'property_age': data.get('property_age'),
                'foundation_type': data.get('foundation_type'),
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
                for att in line_data.get('location_attachments', []):
                    self._create_attachment(att, 'electrical.socket.line', socket_line.id, 'location_attachments')
                for att in line_data.get('route_attachments', []):
                    self._create_attachment(att, 'electrical.socket.line', socket_line.id, 'route_attachments')

            # Handle general attachments
            for att in data.get('attachments', []):
                self._create_attachment(att, 'electrical.job.request', job_request.id)

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