// static/src/js/templates/fuse_board_step.xml.js
import { xml } from "@odoo/owl";

export const fuseBoardStepTemplate = xml`
<h3>Step 3: Fuse Board Details</h3>
<p>These details help us assess safety and pricing accurately.</p>
<div class="form-group">
    <label>Property Type <span style="color: red;">*</span></label>
    <select t-model="state.building_type" class="form-control">
        <option value="">Select...</option>
        <option value="house">House</option>
        <option value="flat">Flat/Apartment</option>
        <option value="other">Other</option>
    </select>
</div>
<div class="form-group">
    <label>Property Age <span style="color: red;">*</span></label>
    <select t-model="state.construction_age" class="form-control">
        <option value="">Select...</option>
        <option value="pre1950">Before 1950</option>
        <option value="1950-1980">1950-1980</option>
        <option value="post1980">After 1980</option>
        <option value="unknown">Not Sure</option>
    </select>
</div>
<div class="form-group">
    <label>Loft Access Available?</label>
    <select t-model="state.attic_access_availability" class="form-control">
        <option value="">Select...</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
        <option value="unknown">Not Sure</option>
    </select>
</div>
<div class="form-group">
    <label>Photo of Fuse Board <span style="color: red;">*</span></label>
    <input type="file" id="fuse_board_photo_attachment" t-on-change="(ev) => this.handleSingleFileChange('fuse_board_photo_attachment', ev)" accept="image/*,text/plain" class="form-control" />
    <small class="form-text text-muted">A clear photo of your fuse board helps us assess capacity.</small>
    <div t-if="state.fuse_board_photo_attachment" class="mt-2 d-flex flex-wrap">
        <div class="m-1">
            <img t-att-src="state.fuse_board_photo_attachment.thumbnail || ''" style="max-width: 100px;"/>
            <span t-esc="state.fuse_board_photo_attachment.name"/>
            <button type="button" t-on-click="() => this.handleRemoveSingle('fuse_board_photo_attachment')" class="btn btn-sm btn-danger ml-2">Remove</button>
        </div>
    </div>
</div>
<div class="form-group">
    <label>Panel Type</label>
    <select t-model="state.electrical_panel_type" class="form-control">
        <option value="">Select...</option>
        <option value="breakers">Modern (Circuit Breakers)</option>
        <option value="fuses">Older (Fuses)</option>
        <option value="unknown">Not Sure</option>
    </select>
</div>
<div class="form-group">
    <label>Recent Electrical Upgrades?</label>
    <input type="text" t-model="state.recent_electrical_upgrades" class="form-control" placeholder="e.g., New panel in 2020"/>
</div>
`;