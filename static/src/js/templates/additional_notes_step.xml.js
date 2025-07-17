// static/src/js/templates/additional_notes_step.xml.js
import { xml } from "@odoo/owl";

export const additionalNotesStepTemplate = xml`
<h3>Step 5: Anything Else?</h3>
<div class="form-group">
    <label for="additional_notes">Additional Notes</label>
    <textarea id="additional_notes" t-model="state.additional_notes" class="form-control" rows="4" placeholder="Any other details or special requirements..."/>
</div>
<div class="form-group">
    <label for="general_site_video_attachments">General Site Videos</label>
    <input type="file" id="general_site_video_attachments" multiple="multiple" accept="video/*" t-on-change="(ev) => this.handleMultiFileChange('general_site_video_attachments', ev, ['video/mp4', 'video/mpeg', 'video/webm'])" class="form-control"/>
    <small class="form-text text-muted">Upload any general site videos.</small>
    <div t-if="state.general_site_video_attachments.length" class="mt-2">
        <ul class="list-unstyled">
            <t t-foreach="state.general_site_video_attachments" t-as="file" t-key="file_index">
                <li class="d-flex align-items-center mb-2">
                    <span>
                        <t t-esc="file.name"/> (<t t-esc="(file.size / 1024 / 1024).toFixed(2)"/> MB)
                        <button type="button" t-on-click="() => this.handleRemoveFromArray('general_site_video_attachments', file_index)" class="btn btn-sm btn-danger ml-2">Remove</button>
                    </span>
                </li>
            </t>
        </ul>
    </div>
</div>
<div class="form-group">
    <label for="unknown_attachment">Unknown Attachment</label>
    <input type="file" id="unknown_attachment" t-on-change="(ev) => this.handleSingleFileChange('unknown_attachment', ev)" class="form-control"/>
    <div t-if="state.unknown_attachment" class="mt-2">
        <span t-esc="state.unknown_attachment.name"/>
        <button type="button" t-on-click="() => this.handleRemoveSingle('unknown_attachment')" class="btn btn-sm btn-danger ml-2">Remove</button>
    </div>
</div>
`;