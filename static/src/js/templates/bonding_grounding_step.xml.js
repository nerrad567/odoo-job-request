// static/src/js/templates/bonding_grounding_step.xml.js
import { xml } from "@odoo/owl";

export const bondingGroundingStepTemplate = xml`
<h3>Step 2: Bonding &amp; Grounding</h3>
<p>Earth Bonding connects metal incoming services to ground for safety. Look for green/yellow wire clamps near valves or meter boxes.</p>
<div class="form-group">
    <label>Water Bond Present? <span style="color: red;">*</span></label>
    <select t-model="state.water_is_present" class="form-control" >
        <option value="">Select...</option>
        <option value="false">No</option>
        <option value="true">Yes</option>
        <option value="unknown">Not Sure</option>
    </select>
    <div t-if="state.water_is_present === 'true'">
        <label>Location Description</label>
        <input type="text" t-model="state.water_installation_location" class="form-control" placeholder="e.g., Under kitchen sink"/>
        <label>Photo</label>
        <input type="file" t-on-change="(ev) => this.handleSingleFileChange('water_photo_attachment', ev)" accept="image/*" class="form-control"/>
        <div t-if="state.water_photo_attachment" class="mt-2 d-flex flex-wrap">
            <div class="m-1">
                <img t-att-src="state.water_photo_attachment.thumbnail || ''" style="max-width: 100px;"/>
                <span t-esc="state.water_photo_attachment.name"/>
                <button type="button" t-on-click="() => this.handleRemoveSingle('water_photo_attachment')" class="btn btn-sm btn-danger ml-2">Remove</button>
            </div>
        </div>
    </div>
</div>
<div class="form-group">
    <label>Gas Bond Present? <span style="color: red;">*</span></label>
    <select t-model="state.gas_is_present" class="form-control" >
        <option value="">Select...</option>
        <option value="false">No</option>
        <option value="true">Yes</option>
        <option value="unknown">Not Sure</option>
    </select>
    <div t-if="state.gas_is_present === 'true'">
        <label>Location Description</label>
        <input type="text" t-model="state.gas_installation_location" class="form-control" placeholder="e.g., Near gas meter"/>
        <label>Photo</label>
        <input type="file" t-on-change="(ev) => this.handleSingleFileChange('gas_photo_attachment', ev)" accept="image/*" class="form-control"/>
        <div t-if="state.gas_photo_attachment" class="mt-2 d-flex flex-wrap">
            <div class="m-1">
                <img t-att-src="state.gas_photo_attachment.thumbnail || ''" style="max-width: 100px;"/>
                <span t-esc="state.gas_photo_attachment.name"/>
                <button type="button" t-on-click="() => this.handleRemoveSingle('gas_photo_attachment')" class="btn btn-sm btn-danger ml-2">Remove</button>
            </div>
        </div>
    </div>
</div>
<div class="form-group">
    <label>Oil Bond Present? <span style="color: red;">*</span></label>
    <select t-model="state.oil_is_present" class="form-control" >
        <option value="">Select...</option>
        <option value="false">No</option>
        <option value="true">Yes</option>
        <option value="unknown">Not Sure</option>
    </select>
    <div t-if="state.oil_is_present === 'true'">
        <label>Location Description</label>
        <input type="text" t-model="state.oil_installation_location" class="form-control" placeholder="e.g., Near oil tank"/>
        <label>Photo</label>
        <input type="file" t-on-change="(ev) => this.handleSingleFileChange('oil_photo_attachment', ev)" accept="image/*" class="form-control"/>
        <div t-if="state.oil_photo_attachment" class="mt-2 d-flex flex-wrap">
            <div class="m-1">
                <img t-att-src="state.oil_photo_attachment.thumbnail || ''" style="max-width: 100px;"/>
                <span t-esc="state.oil_photo_attachment.name"/>
                <button type="button" t-on-click="() => this.handleRemoveSingle('oil_photo_attachment')" class="btn btn-sm btn-danger ml-2">Remove</button>
            </div>
        </div>
    </div>
</div>
<div class="form-group">
    <label>Other Buried Services Present? <span style="color: red;">*</span></label>
    <select t-model="state.other_services_is_present" class="form-control" >
        <option value="">Select...</option>
        <option value="false">No</option>
        <option value="true">Yes</option>
        <option value="unknown">Not Sure</option>
    </select>
    <div t-if="state.other_services_is_present === 'true'">
        <label>Description</label>
        <input type="text" t-model="state.other_services_description" class="form-control" placeholder="e.g., Underground cable"/>
        <label>Photo</label>
        <input type="file" t-on-change="(ev) => this.handleSingleFileChange('other_photo_attachment', ev)" accept="image/*" class="form-control"/>
        <div t-if="state.other_photo_attachment" class="mt-2 d-flex flex-wrap">
            <div class="m-1">
                <img t-att-src="state.other_photo_attachment.thumbnail || ''" style="max-width: 100px;"/>
                <span t-esc="state.other_photo_attachment.name"/>
                <button type="button" t-on-click="() => this.handleRemoveSingle('other_photo_attachment')" class="btn btn-sm btn-danger ml-2">Remove</button>
            </div>
        </div>
    </div>
</div>
`;