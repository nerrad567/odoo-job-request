// static/src/js/templates/ev_charger_step.xml.js
import { xml } from "@odoo/owl";

export const evChargerStepTemplate = xml`
<h3>Step 2: EV Charger Details</h3>
<div class="form-group">
    <label>Power Rating</label>
    <input type="text" t-model="state.power_rating" class="form-control" placeholder="e.g., 7kW"/>
</div>
<div class="form-group">
    <label>Installation Location</label>
    <input type="text" t-model="state.installation_location" class="form-control" placeholder="e.g., Garage wall"/>
</div>
<div class="form-group">
    <label>Comments</label>
    <textarea t-model="state.ev_comments" class="form-control" rows="3"/>
</div>
<div class="form-group">
    <label>Attachments (Photos/Videos)</label>
    <input type="file" multiple="multiple" t-on-change="(ev) => this.handleMultiFileChange('ev_attachments', ev, ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mpeg', 'video/webm'])" accept="image/*,video/*" class="form-control"/>
    <div t-if="state.ev_attachments.length" class="mt-2 d-flex flex-wrap">
        <t t-foreach="state.ev_attachments" t-as="file" t-key="file_index">
            <div class="m-1">
                <img t-att-src="file.thumbnail || ''" style="max-width: 100px;"/>
                <span t-esc="file.name"/>
                <button type="button" t-on-click="() => this.handleRemoveFromArray('ev_attachments', file_index)" class="btn btn-sm btn-danger ml-2">Remove</button>
            </div>
        </t>
    </div>
</div>
`;