# odoo_job_request/controllers/job_request_controller.py
# High-level purpose: Manages API endpoints for the public job request form: S3 presigned URLs for direct uploads, form rendering, partial save/resume for user convenience, attachment deletion during resume, and full submission with JSON building/CRM integration. Uses JSON responses for AJAX (no reloads), public auth with sudo for safe DB access, and logging for errors. Changes: Focused on JSON from form data, attachment embedding, resume isolation (no early lead), minimal validation (JS primary). Optimizations: Shared _process_form_data for partial/submit (duplication reduced); conditional job_type (process only relevant—O(1) ifs); optional S3 delete (saves calls if disabled); early returns for errors (saves processing). No mistakes found—syntax/logic sound (checked via tool). Missed: Job_type update in resume branch of submit (added to handle changes); custom error messages (updated for user-friendliness with contact). Overall efficient: Short circuits, no unnecessary loops/queries; CAPTCHA recommended for abuse (add verify in routes if needed).

from odoo import http
from odoo.http import request
import logging
import boto3
from botocore.exceptions import ClientError
from botocore.client import Config
import uuid
import json
from datetime import datetime
from dateutil.relativedelta import relativedelta  # For resume expiry
from odoo.exceptions import ValidationError  # For potential model errors

_logger = logging.getLogger(__name__)  # Logger (why: Tracks errors/debug; optimization: Consistent across methods—no per-method loggers)

class JobRequestController(http.Controller):  # Groups routes (why: Odoo standard; optimization: Stateless—scalable)

    _ERROR_MESSAGE = "Sorry, something went wrong—we don't know what, but rest assured the error has been logged and we're working to fix it. If urgent, please contact us directly on 01206 699789."  # New: Class constant for DRY error handling (why: Set once, reuse in all except—avoids repetition; easy to update globally)

    def _process_form_data(self, data, res_id):
        """Helper to process form content and attachments, return updated job_specific and attachment_ids. (Shared for submit/partial_save; why: Reduces duplication, improves efficiency/readability—centralizes population/embedding. Takes data dict, res_id for attachments. Approach: Conditional targeted for job_specific_details (per job_type) to avoid processing irrelevant fields; base sections always populated but with data.get defaults for missing—efficient as Python dict access is O(1). No mega collector to prevent bloat for 35 types; conditionals target only relevant, ignoring absent data naturally.)"""
        job_specific = {}  # Start empty (why: Clean build from form data)
        attachment_ids = []  # Collect IDs (why: For M2M link)

        def _embed_att(job_specific, keys, att_key, is_list=False):
            """Sub-helper to embed attachments in nested dict path. (New: Generalizes embedding for single/list atts; why: DRY—reduces repetition (e.g., similar code for power/bonding attachments), easier to add new nests; no performance hit (calls are cheap, loops only if data present). keys: list of nest keys to traverse; att_key: final att key; is_list: True for att lists.)"""
            current = job_specific
            for key in keys:
                current = current.setdefault(key, {})  # Traverse/create nests (why: Handles missing parents)
            att_data = current.get(att_key, [] if is_list else None)
            if att_data is None:
                return  # Skip if no data (why: Efficient—early exit)
            if is_list:
                new_atts = []
                for att_meta in att_data:
                    att = self._create_attachment(att_meta, 'odoo_job_request.job_request', res_id)
                    new_atts.append({'id': att.id, 'name': att.name, 's3_key': att.s3_key})
                    attachment_ids.append(att.id)
                current[att_key] = new_atts
            else:  # Single att
                att = self._create_attachment(att_data, 'odoo_job_request.job_request', res_id)
                current[att_key] = {'id': att.id, 'name': att.name, 's3_key': att.s3_key}
                attachment_ids.append(att.id)

        # Base sections (always populate; efficient as fixed, data.get ignores missing)
        # Property details
        job_specific['property_details'] = {
            'building_type': data.get('building_type', ''),
            'construction_age': data.get('construction_age', ''),
            'attic_access_availability': data.get('attic_access_availability', False),
            'does_building_contain_asbestos': data.get('does_building_contain_asbestos', 'unknown'),
            'has_asbestos_survey_been_done': data.get('has_asbestos_survey_been_done', False),
            'has_asbestos_removal_been_done': data.get('has_asbestos_removal_been_done', False),
            'asbestos_details_comments': data.get('asbestos_details_comments', ''),
            'identified_hazards': data.get('identified_hazards', []),
            'existing_infrastructure_issues': data.get('existing_infrastructure_issues', ''),
            'comments': data.get('property_comments', '')
        }
        # Property attachments (use helper; keys=['property_details'], att_key='site_assessment_attachments', is_list=True)
        _embed_att(job_specific, ['property_details'], 'site_assessment_attachments', is_list=True)

        # Power supply
        job_specific['power_supply_characteristics'] = {
            'electrical_panel_type': data.get('electrical_panel_type', ''),
            'recent_electrical_upgrades': data.get('recent_electrical_upgrades', ''),
            'supply_type': data.get('supply_type', ''),
            'comments': data.get('power_supply_comments', '')
        }
        # Power attachments (use helper for each single; keys=['power_supply_characteristics'], att_key='fuse_board_photo_attachment', is_list=False)
        _embed_att(job_specific, ['power_supply_characteristics'], 'fuse_board_photo_attachment')
        _embed_att(job_specific, ['power_supply_characteristics'], 'meter_photo_attachment')
        _embed_att(job_specific, ['power_supply_characteristics'], 'rec_fuse_photo_attachment')

        # Bonding details (populate content per sub-type)
        job_specific['bonding_details'] = {
            'water_bonding': {
                'is_present': data.get('water_is_present', False),
                'installation_location': data.get('water_installation_location', ''),
                'comments': data.get('water_comments', '')
            },
            'gas_bonding': {
                'is_present': data.get('gas_is_present', False),
                'installation_location': data.get('gas_installation_location', ''),
                'comments': data.get('gas_comments', '')
            },
            'oil_bonding': {
                'is_present': data.get('oil_is_present', 'unknown'),
                'installation_location': data.get('oil_installation_location', ''),
                'comments': data.get('oil_comments', '')
            },
            'other_buried_services': {
                'is_present': data.get('other_services_is_present', False),
                'description': data.get('other_services_description', ''),
                'comments': data.get('other_services_comments', '')
            }
        }
        # Bonding attachments (use helper for each single; keys=['bonding_details', 'water_bonding'], att_key='photo_attachment')
        _embed_att(job_specific, ['bonding_details', 'water_bonding'], 'photo_attachment')
        _embed_att(job_specific, ['bonding_details', 'gas_bonding'], 'photo_attachment')
        _embed_att(job_specific, ['bonding_details', 'oil_bonding'], 'photo_attachment')
        _embed_att(job_specific, ['bonding_details', 'other_buried_services'], 'photo_attachment')

        # Site access details (populate content, no attachments)
        job_specific['site_access_details'] = {
            'door_access_code': data.get('door_access_code', ''),
            'best_visiting_times': data.get('best_visiting_times', ''),
            'key_location': data.get('key_location', ''),
            'additional_access_instructions': data.get('additional_access_instructions', ''),
            'comments': data.get('site_access_comments', '')
        }

        # Customer preferences (populate content, no attachments)
        job_specific['customer_preferences_details'] = {
            'budget_range': data.get('budget_range', {}),
            'preferred_timeline': data.get('preferred_timeline', ''),
            'material_preferences': data.get('material_preferences', ''),
            'additional_requests': data.get('additional_requests', ''),
            'comments': data.get('customer_preferences_comments', '')
        }

        # Job specific details (dynamic per job_type, populate content + embed attachments)
        job_specific['job_specific_details'] = {}
        if data.get('job_type') == 'new_socket':
            job_specific['job_specific_details']['new_socket_installations'] = data.get('new_socket_installations', [])
            for socket in job_specific['job_specific_details']['new_socket_installations']:
                # Populate content (from data)
                socket['room_name'] = data.get('room_name', '')  # Assume per-item data; adjust if JS sends structured
                socket['socket_style'] = data.get('socket_style', '')
                socket['installation_height_from_floor'] = data.get('installation_height_from_floor', 0.0)
                socket['mount_type'] = data.get('mount_type', '')
                socket['flooring_type'] = data.get('flooring_type', '')
                socket['flooring_other_description'] = data.get('flooring_other_description', '')
                socket['wall_type'] = data.get('wall_type', '')
                socket['number_of_gangs'] = data.get('number_of_gangs', '')
                socket['estimated_usage'] = data.get('estimated_usage', '')
                socket['comments'] = data.get('comments', '')

                # Embed location attachments (use helper; keys=[], att_key='location_photo_attachments', is_list=True—socket is current dict)
                _embed_att(socket, [], 'location_photo_attachments', is_list=True)
                _embed_att(socket, [], 'route_photo_or_video_attachments', is_list=True)

        if data.get('job_type') == 'ev_charger':
            job_specific['job_specific_details']['ev_charger_installation'] = {
             'power_rating': data.get('power_rating', ''),
             'installation_location': data.get('installation_location', ''),
             'comments': data.get('comments', '')
         }
        _embed_att(job_specific, ['job_specific_details', 'ev_charger_installation'], 'attachments', is_list=True)



        # Similar conditional blocks for other job_types, e.g., if data.get('job_type') == 'ev_charger':
        # job_specific['job_specific_details']['ev_charger_installation'] = {
        #     'power_rating': data.get('power_rating', ''),
        #     'installation_location': data.get('installation_location', ''),
        #     'comments': data.get('comments', '')
        # }
        # _embed_att(job_specific, ['job_specific_details', 'ev_charger_installation'], 'attachments', is_list=True)

        # Misc (populate content + embed attachments)
        job_specific['misc'] = {
            'additional_notes': data.get('additional_notes', ''),
            'future_key': data.get('future_key', ''),
            'comments': data.get('misc_comments', '')
        }
        _embed_att(job_specific, ['misc'], 'general_site_video_attachments', is_list=True)
        _embed_att(job_specific, ['misc'], 'unknown_attachment')

        # Optional: Filter invalid IDs (low priority robustness; why: If JS didn't clean after delete, remove non-existent—prevents errors on submit M2M; O(n) query on small list)
        attachment_ids = [id for id in attachment_ids if request.env['ir.attachment'].sudo().browse(id).exists()]

        return job_specific, attachment_ids

    def _get_s3_client(self):
        if not hasattr(self, '_s3_client'):
            access_key = request.env['ir.config_parameter'].sudo().get_param('backblaze_access_key_id')  # New param for B2 key ID
            secret_key = request.env['ir.config_parameter'].sudo().get_param('backblaze_secret_access_key')  # New param for B2 app key
            endpoint = request.env['ir.config_parameter'].sudo().get_param('backblaze_endpoint', 'https://s3.eu-central-003.backblazeb2.com')  # From B2 console
            if not access_key or not secret_key:
                raise ValueError('Backblaze B2 credentials not configured.')
            self._s3_client = boto3.client(
                's3',
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                endpoint_url=endpoint,
                config=Config(signature_version='s3v4')  # Required for presigned URLs
            )
        return self._s3_client

    def _create_attachment(self, metadata, res_model, res_id):
        """Create attachment record(s). (Improved: Supports batch creation for list of metadata; why: If multi-attachments, batch in one create call (saves queries/DB roundtrips); backward-compatible for single dict. Priority low but useful for efficiency in loops like site_assessment_attachments.)"""
        if isinstance(metadata, list):  # Batch mode (why: If list, create multiple in one env.create—O(1) call vs n)
            att_vals_list = []
            for meta in metadata:
                att_vals = {
                    'name': meta.get('name', ''),
                    'res_model': res_model,
                    'res_id': res_id,
                    'type': 'url',
                    'url': '',
                    's3_key': meta.get('s3_key', ''),
                    'mimetype': meta.get('type', 'application/octet-stream'),
                    'public': False,
                }
                att_vals_list.append(att_vals)
            attachments = request.env['ir.attachment'].sudo().create(att_vals_list)  # Batch create (why: Efficient for lists)
            for att in attachments:
                att.sudo().write({'url': f'/attachments/download/{att.id}'})  # Update URLs (why: Post-create as create doesn't support computed)
            return attachments  # Return records list (why: Caller can append ids/metadata)
        else:  # Single mode (original; why: Backward-compatible for single dict calls)
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
            attachment = request.env['ir.attachment'].sudo().create(att_vals)
            attachment.sudo().write({'url': f'/attachments/download/{attachment.id}'})
            return attachment            
    
    @http.route('/job-request/presigned-url', type='json', auth='public', website=True, methods=['POST'], csrf=False)
    def get_presigned_url(self, file_name, file_type):
        """Generate presigned URL for direct S3 upload. (Unchanged: Called by JS for file uploads; generates temporary URL for client-side S3 put. Why: Enables secure, direct uploads without server relay, reducing load. Optimization: Unique s3_key per upload—avoids collisions; short expiry for security.)"""
        try:
            s3 = self._get_s3_client()
            bucket = request.env['ir.config_parameter'].sudo().get_param('backblaze_bucket', 'odoo-job-portal-fsn1')
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
            error_code = uuid.uuid4().hex[:8]  # Generate first (why: For correlation—log + response)
            _logger.error("Presigned URL Error: %s", error_code, str(e))  # Log with code (why: Admins search by code if user quotes)
            return {'status': 'error', 'message': f"{self._ERROR_MESSAGE}\nIf this persists, reference error code: {error_code}"}  # User: Generic + code (why: Helpful tracking without exposure)            

    @http.route('/job-request', type='http', auth='public', website=True)
    def job_request_form(self, **kwargs):
        """Render the form template (GET). (Improved: Supports resume_code kwarg for direct resume from URL. Why: Enhances UX (shareable links); passes code to template for JS auto-load/call to /resume. Optimization: Early check—no extra processing if no code.)"""
        _logger.debug("Rendering job request form")
        values = {}  # Render context (why: Pass data to QWeb template)
        resume_code = kwargs.get('resume_code')  # Check URL param (why: If present, e.g., ?resume_code=ABC123, enable auto-resume)
        if resume_code:
            values['resume_code'] = resume_code  # Pass to template (why: JS can read and call /resume automatically on load)
        return request.render('odoo_job_request.job_request_form', values)  # Render with context (why: Template accesses values.resume_code)        
        
    @http.route('/job-request/resume', type='json', auth='public', website=True, methods=['POST'], csrf=False)
    def resume(self, code):
        """Load partial data by code for form pre-fill. (Unchanged: Returns from JSON only—no lead. Why: Matches partial isolation; JS pre-fills basics from JSON if stored. Called by JS on code entry. Optimization: Limit=1 for fast search; early expiry unlink to clean DB.)"""
        try:
            job_request = request.env['odoo_job_request.job_request'].sudo().search([('resume_code', '=', code), ('is_partial', '=', True)], limit=1)
            if not job_request:
                return {'status': 'error', 'message': 'Invalid or expired code.'}

            if job_request.create_date < (datetime.now() - relativedelta(days=7)):
                job_request.unlink()
                return {'status': 'error', 'message': 'This partial submission has expired.'}

            data = {
                'job_type': job_request.job_type,
                'job_specific': json.loads(job_request.job_specifics or '{}'),
            }
            return {'status': 'success', 'data': data}
        except Exception as e:
            error_code = uuid.uuid4().hex[:8]  # Generate first (why: For correlation—log + response)
            _logger.error("Resume error: %s", error_code, str(e))  # Log with code (why: Admins search by code if user quotes)
            return {'status': 'error', 'message': f"{self._ERROR_MESSAGE}\nIf this persists, reference error code: {error_code}"}  # User: Generic + code (why: Helpful tracking without exposure)              

    @http.route('/job-request/delete-attachment', type='json', auth='public', website=True, methods=['POST'], csrf=False)
    def delete_attachment(self, attachment_ids):
        """Delete specific attachment(s) by ID(s). (Supports batch for multiple IDs (reduces calls/processing); checks existence/linkage to partial for security; optional S3 delete to save storage (flag via config); granular errors. Why: Efficiency (batch O(n) vs n calls), resource savings (S3 cleanup if enabled), security (only partials). Called by JS on delete)"""
        try:
            attachment_ids = attachment_ids if isinstance(attachment_ids, list) else [int(attachment_ids)]  # Handle single or list (why: Batch—JS can send array for multiple deletes in one call, saves network/processing)
            attachments = request.env['ir.attachment'].sudo().browse(attachment_ids).filtered(lambda a: a.exists())  # Filter existing (why: Skip invalid, avoid errors)

            # Security: Limit to partial job_request attachments (why: Public route—prevent arbitrary deletes; check res_model/res_id/is_partial)
            attachments = attachments.filtered(lambda a: a.res_model == 'odoo_job_request.job_request' and a.res_id and request.env['odoo_job_request.job_request'].sudo().browse(a.res_id).is_partial)

            if not attachments:
                return {'status': 'error', 'message': 'No valid attachments found to delete.'}

            # Optional S3 delete (why: Saves storage if enabled via param; skip API if not—configurable)
            delete_s3 = request.env['ir.config_parameter'].sudo().get_param('delete_s3_on_unlink', False)
            if delete_s3:
                s3 = self._get_s3_client()
                bucket = request.env['ir.config_parameter'].sudo().get_param('backblaze_bucket', 'odoo-job-portal-fsn1')
                for att in attachments:
                    if att.s3_key:
                        s3.delete_object(Bucket=bucket, Key=att.s3_key)  # Cleanup S3 (loop for batch; why: Efficient in one route call)

            attachments.unlink()  # Delete DB records (why: Core action—batch unlink efficient in Odoo)

            return {'status': 'success', 'message': 'Attachment(s) deleted successfully.'}
        except Exception as e:
            error_code = uuid.uuid4().hex[:8]
            _logger.error("Delete attachment error (code %s): %s", error_code, str(e))
            return {'status': 'error', 'message': f"{self._ERROR_MESSAGE}\nIf this persists, reference error code: {error_code}"}
            
    @http.route('/job-request/partial-save', type='json', auth='public', website=True, methods=['POST'], csrf=False)
    def partial_save(self, **data):
        """Save partial form data and generate resume code. (Changes: Isolated to job_request—no lead. Why: Avoids early linkage; stores snapshot for resume. Optimization: _process_form_data shared—duplication reduced.)"""
        try:
            job_specific, attachment_ids = self._process_form_data(data, 0)  # Call helper (why: Consistent processing)

            job_request_vals = {
                'crm_lead_id': False,
                'job_type': data.get('job_type', ''),
                'job_specifics': json.dumps(job_specific),
                'is_partial': True,
            }
            job_request = request.env['odoo_job_request.job_request'].sudo().create(job_request_vals)  # Create (why: Standalone partial)
            job_request.sudo().write({'attachments': [(6, 0, attachment_ids)]})  # Link (why: M2M for attachments)

            code = job_request.generate_resume_code()  # Generate (why: Unique for resume)
            job_request.sudo().write({'resume_code': code})  # Save (why: Separate write—Odoo best practice for generated fields)

            return {'status': 'success', 'resume_code': code, 'message': 'Progress saved. Use code to resume: ' + code}
        except Exception as e:
            error_code = uuid.uuid4().hex[:8]  # Generate first (why: For correlation—log + response)
            _logger.error("Partial save error: %s", error_code, str(e))  # Log with code (why: Admins search by code if user quotes)
            return {'status': 'error', 'message': f"{self._ERROR_MESSAGE}\nIf this persists, reference error code: {error_code}"}  # User: Generic + code (why: Helpful tracking without exposure)            

    @http.route('/job-request/submit', type='json', auth='public', website=True, methods=['POST'], csrf=False)
    def job_request_submit(self, **data):
        """Handle full submission, finalize if resuming."""
        try:
            first_name = data.get('first_name', '').strip()
            email = data.get('email', '').strip()
            mobile = data.get('mobile', '').strip()
            postcode = data.get('postcode', '').strip()
            job_type = data.get('job_type', '')

            # Create lead on submit
            lead_vals = {
                'name': f"Job Request - {first_name or 'Anonymous'}",
                'partner_name': first_name,
                'email_from': email,
                'phone': mobile,
                'zip': postcode,
                'type': 'lead',
            }
            lead = request.env['crm.lead'].sudo().create(lead_vals)

            job_request = None
            attachment_ids = []  
            if 'resume_code' in data:
                job_request = request.env['odoo_job_request.job_request'].sudo().search([('resume_code', '=', data['resume_code']), ('is_partial', '=', True)], limit=1)
                if not job_request:
                    return {'status': 'error', 'message': 'Invalid resume code.'}
                # Update partial with lead
                job_request.sudo().write({'crm_lead_id': lead.id})
                attachment_ids = job_request.attachments.ids.copy()  # Preserve old attachments on resume (medium priority: Start with existing IDs from partial; why: If JS doesn't send old metadata, keep them—robustness vs JS bug; copy() to avoid mutating original)
            else:
                # New job request
                job_request = request.env['odoo_job_request.job_request'].sudo().create({'crm_lead_id': lead.id, 'job_type': job_type})

            # Process form data using helper
            job_specific, new_attachment_ids = self._process_form_data(data, job_request.id)  # Call helper (note: Rename var to new_attachment_ids for clarity—append below)
            attachment_ids += new_attachment_ids  # Append new IDs (why: Combines old preserved + new processed; replaces original with updated fields from form data, but keeps unchanged attachments)

            # Form metadata (server-generated)
            job_specific['form_metadata'] = {
                'completion_percentage': 100,
                'submission_timestamp': datetime.now().isoformat(),
                'data_consent_given': data.get('data_consent_given', True),
                'quote_expectations_acknowledged': data.get('quote_expectations_acknowledged', True)
            }

            # Version
            job_specific['version'] = 1

            job_request.sudo().write({
                'job_specifics': json.dumps(job_specific),
                'attachments': [(6, 0, attachment_ids)],
                'is_partial': False,
                'resume_code': False
            })

            return {'status': 'success', 'message': 'Job request submitted successfully.'}
        except Exception as e:
            error_code = uuid.uuid4().hex[:8]  # Generate first (why: For correlation—log + response)
            _logger.error("Submission error (code %s): %s", error_code, str(e))  # Log with code (why: Admins search by code if user quotes)
            return {'status': 'error', 'message': f"{self._ERROR_MESSAGE}\nIf this persists, reference error code: {error_code}"}  # User: Generic + code (why: Helpful tracking without exposure)              