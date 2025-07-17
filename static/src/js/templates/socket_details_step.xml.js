// static/src/js/templates/socket_details_step.xml.js
import { xml } from "@odoo/owl";

export const socketDetailsStepTemplate = xml`
<h3>Step 4: Socket Details [Total: <t t-esc="state.new_socket_installations.length"/>]</h3>
<p>Specify details for each socket to ensure accurate pricing.</p>
<div class="form-group">
    <label>Number of Sockets <span style="color: red;">*</span></label>
    <input type="number" t-model.number="state.num_sockets" min="1" class="form-control" t-on-change="prepopulateSockets" />
    <small class="form-text text-muted">Enter the number of sockets to prefill the form below.</small>
</div>
<div t-foreach="state.new_socket_installations" t-as="line" t-key="line_index" class="socket-line mb-3 border p-3">
    <h5>Socket <t t-esc="line_index + 1"/></h5>
    <div class="form-group">
        <label>Room Name <span style="color: red;">*</span></label>
        <input type="text" t-model="line.room_name" class="form-control" placeholder="e.g., Living Room"/>
    </div>
    <div class="form-group">
        <label>Socket Style <span style="color: red;">*</span></label>
        <select t-model="line.socket_style" class="form-control" >
            <option value="">Select...</option>
            <t t-foreach="socketStyles" t-as="style" t-key="style_index">
                <option t-att-value="style.value" t-esc="style.label"/>
            </t>
        </select>
    </div>
    <div class="form-group">
        <label>Height from Floor (m) <span style="color: red;">*</span></label>
        <input type="number" t-model.number="line.installation_height_from_floor" class="form-control" min="0.01" step="any" placeholder="e.g., 0.3"/>
        <small class="form-text text-muted">Typical height is 0.3m for standard sockets.</small>
    </div>
    <div class="form-group">
        <label>Mount Type <span style="color: red;">*</span></label>
        <select t-model="line.mount_type" class="form-control" >
            <option value="">Select...</option>
            <option value="surface">Surface (on wall)</option>
            <option value="flush">Flush (in wall)</option>
        </select>
    </div>
    <div class="form-group">
        <label>Flooring Type <span style="color: red;">*</span></label>
        <select t-model="line.flooring_type" class="form-control" >
            <option value="">Select...</option>
            <option value="carpet">Carpet</option>
            <option value="laminate">Laminate</option>
            <option value="tile">Tile</option>
            <option value="wood">Wood</option>
            <option value="other">Other</option>
        </select>
        <div t-if="line.flooring_type === 'other'">
            <label>Describe Other Flooring</label>
            <input type="text" t-model="line.flooring_other_description" class="form-control" placeholder="Describe..."/>
        </div>
    </div>
    <div class="form-group">
        <label>Wall Type</label>
        <select t-model="line.wall_type" class="form-control">
            <option value="">Select...</option>
            <option value="plasterboard">Plasterboard/Drywall</option>
            <option value="brick">Brick/Concrete</option>
            <option value="tiled">Tiled Wall</option>
            <option value="glass_splashback">Glass Splashback</option>
            <option value="metal_splashback">Metal Splashback</option>
            <option value="cladding">Cladding</option>
            <option value="other">Other/Not Sure</option>
        </select>
        <small class="form-text text-muted">Wall type affects installation complexity.</small>
    </div>
    <div class="form-group">
        <label>Number of Gangs</label>
        <select t-model="line.number_of_gangs" class="form-control">
            <option value="">Select...</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
        </select>
    </div>
    <div class="form-group">
        <label>Estimated Usage</label>
        <input type="text" t-model="line.estimated_usage" class="form-control" placeholder="e.g., For TV or charging"/>
    </div>
    <div class="form-group">
        <label>Photo of Desired Location</label>
        <input type="file" multiple="multiple" t-on-change="(ev) => this.handleMultiFileChange('location_photo_attachments', ev, ['image/jpeg', 'image/png', 'image/gif'], line_index)" accept="image/*" class="form-control"/>
        <small class="form-text text-muted">Upload a photo showing where the socket will be placed.</small>
        <div t-if="line.location_photo_attachments.length" class="mt-2 d-flex flex-wrap">
            <t t-foreach="line.location_photo_attachments" t-as="file" t-key="file_index">
                <div class="m-1">
                    <img t-att-src="file.thumbnail || ''" style="max-width: 100px;"/>
                    <span t-esc="file.name"/>
                    <button type="button" t-on-click="() => this.handleRemoveFromArray('location_photo_attachments', file_index, line_index)" class="btn btn-sm btn-danger ml-2">Remove</button>
                </div>
            </t>
        </div>
    </div>
    <div class="form-group">
        <label>Photo/Video of Route &amp; Supply</label>
        <input type="file" multiple="multiple" t-on-change="(ev) => this.handleMultiFileChange('route_photo_or_video_attachments', ev, ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mpeg', 'video/webm'], line_index)" accept="image/*,video/*" class="form-control"/>
        <small class="form-text text-muted">Tip: A short video tracing the route from the nearest socket or fuse board helps us quote accurately.</small>
        <div t-if="line.route_photo_or_video_attachments.length" class="mt-2 d-flex flex-wrap">
            <t t-foreach="line.route_photo_or_video_attachments" t-as="file" t-key="file_index">
                <div class="m-1">
                    <t t-if="file.thumbnail">
                        <img t-att-src="file.thumbnail || ''" style="max-width: 100px;"/>
                    </t>
                    <span t-esc="file.name"/>
                    <button type="button" t-on-click="() => this.handleRemoveFromArray('route_photo_or_video_attachments', file_index, line_index)" class="btn btn-sm btn-danger ml-2">Remove</button>
                </div>
            </t>
        </div>
    </div>
    <div class="form-group">
        <label>Additional Comments</label>
        <textarea t-model="line.comments" class="form-control" rows="3" placeholder="Any specific requirements for this socket..."/>
    </div>
    <button type="button" t-on-click="() => this.removeSocketLine(line_index)" class="btn btn-danger" t-if="state.new_socket_installations.length > 1">Remove Socket</button>
</div>
<button type="button" t-on-click="addSocketLine" class="btn btn-secondary mt-3">Add Another Socket</button>
`;