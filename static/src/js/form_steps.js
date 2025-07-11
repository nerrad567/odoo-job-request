odoo.define('electrical_job_request.form_steps', ['@odoo/owl'], function (require) {
    'use strict';

    const { xml } = require('@odoo/owl');

    const template = xml`
        <div class="job-request-form">
            <h1>Electrical Job Request</h1>
            <form t-ref="form" t-on-submit.prevent="submitForm">
                <div t-if="state.current_step === 1">
                    <h3>Step 1: Basic Information</h3>
                    <div class="form-group">
                        <label for="name">Your Name <span style="color: red;">*</span></label>
                        <input type="text" id="name" t-model="state.name" class="form-control" required="required"/>
                    </div>
                    <div class="form-group">
                        <label for="email">Email <span style="color: red;">*</span></label>
                        <input type="email" id="email" t-model="state.email" class="form-control" required="required"/>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone</label>
                        <input type="text" id="phone" t-model="state.phone" class="form-control"/>
                    </div>
                    <div class="form-group">
                        <label for="job_type">Job Type <span style="color: red;">*</span></label>
                        <select id="job_type" t-model="state.job_type" t-on-change="updateJobType" class="form-control" required="required">
                            <option value="">Select a job type</option>
                            <option value="new_socket">New Socket</option>
                        </select>
                    </div>
                </div>
                <div t-if="state.job_type === 'new_socket' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: General Property Details</h3>
                    <p>These help us assess safety and pricing accurately. Photos are optional but useful.</p>
                    <div class="form-group">
                        <label>Property Type <span style="color: red;">*</span></label>
                        <select t-model="state.property_type" class="form-control" required="required">
                            <option value="">Select...</option>
                            <option value="house">House</option>
                            <option value="flat">Flat/Apartment</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Approximate Property Age <span style="color: red;">*</span></label>
                        <select t-model="state.property_age" class="form-control" required="required">
                            <option value="">Select...</option>
                            <option value="pre1950">Before 1950</option>
                            <option value="1950-1980">1950-1980</option>
                            <option value="post1980">After 1980</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Loft  Access Available?</label>
                        <select t-model="state.attic_access" class="form-control">
                            <option value="">Select...</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Photo of Fuse Board / Electrical Panel <span style="color: red;">*</span></label>
                        <input type="file" id="fuse_board" t-on-change="onFuseBoardChange" accept="image/*" class="form-control" required="required"/>
                        <div t-if="state.fuse_board_attachment" class="mt-2">
                            <img t-att-src="state.fuse_board_attachment.thumbnail" style="max-width: 100px;"/>
                            <span t-esc="state.fuse_board_attachment.name"/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Panel Type</label>
                        <select t-model="state.panel_type" class="form-control">
                            <option value="">Select...</option>
                            <option value="breakers">Modern (Circuit Breakers)</option>
                            <option value="fuses">Older (Fuses)</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Any Recent Electrical Upgrades? (e.g., new panel in last 10 years)</label>
                        <input type="text" t-model="state.recent_upgrades" class="form-control" placeholder="e.g., New panel in 2020"/>
                    </div>
                </div>
                <div t-if="state.job_type === 'new_socket' &amp;&amp; state.current_step === 3">
                    <h3>Step 3: Bonding &amp; Grounding</h3>
                    <label>Earth Bonding</label>
                        <p class="text-muted">Bonding connects metal incoming services to ground for safety. Look for a green/yellow wire clamps to the service.</p>
                        <p class="text-muted">Check inside near valves &amp; outside in meter boxes</p>
                    <div class="form-group">
                        <label>Water Bond Present?</label>
                        <select t-model="state.water_bond" class="form-control">
                            <option value="">Select...</option>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                        <div t-if="state.water_bond === 'yes'">
                            <label>Location Description</label>
                            <input type="text" t-model="state.water_bond_location" class="form-control"/>
                            <label>Photo</label>
                            <input type="file" t-on-change="onWaterBondPhotoChange" accept="image/*" class="form-control"/>
                            <div t-if="state.water_bond_attachment" class="mt-2">
                                <img t-att-src="state.water_bond_attachment.thumbnail" style="max-width: 100px;"/>
                                <span t-esc="state.water_bond_attachment.name"/>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Gas Bond Present?</label>
                        <select t-model="state.gas_bond" class="form-control">
                            <option value="">Select...</option>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                        <div t-if="state.gas_bond === 'yes'">
                            <label>Location Description</label>
                            <input type="text" t-model="state.gas_bond_location" class="form-control"/>
                            <label>Photo</label>
                            <input type="file" t-on-change="onGasBondPhotoChange" accept="image/*" class="form-control"/>
                            <div t-if="state.gas_bond_attachment" class="mt-2">
                                <img t-att-src="state.gas_bond_attachment.thumbnail" style="max-width: 100px;"/>
                                <span t-esc="state.gas_bond_attachment.name"/>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Oil Bond Present?</label>
                        <select t-model="state.oil_bond" class="form-control">
                            <option value="">Select...</option>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                        <div t-if="state.oil_bond === 'yes'">
                            <label>Location Description</label>
                            <input type="text" t-model="state.oil_bond_location" class="form-control"/>
                            <label>Photo</label>
                            <input type="file" t-on-change="onOilBondPhotoChange" accept="image/*" class="form-control"/>
                            <div t-if="state.oil_bond_attachment" class="mt-2">
                                <img t-att-src="state.oil_bond_attachment.thumbnail" style="max-width: 100px;"/>
                                <span t-esc="state.oil_bond_attachment.name"/>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Other Buried Services or Steel Work Entering Property? (e.g., underground cables)</label>
                        <select t-model="state.other_services" class="form-control">
                            <option value="">Select...</option>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                        <div t-if="state.other_services === 'yes'">
                            <label>Description</label>
                            <textarea t-model="state.other_services_desc" class="form-control"/>
                            <label>Photo</label>
                            <input type="file" t-on-change="onOtherServicesPhotoChange" accept="image/*" class="form-control"/>
                            <div t-if="state.other_services_attachment" class="mt-2">
                                <img t-att-src="state.other_services_attachment.thumbnail" style="max-width: 100px;"/>
                                <span t-esc="state.other_services_attachment.name"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div t-if="state.job_type === 'new_socket' &amp;&amp; state.current_step === 4">
                    <h3>Step 4: Socket Details [Total - <t t-esc="state.socket_lines.length"/>]</h3>
                    <div t-foreach="state.socket_lines" t-as="line" t-key="line_index" class="socket-line mb-3">
                        <div class="form-group">
                            <label>Room Name <span style="color: red;">*</span></label>
                            <input type="text" t-model="line.room_name" class="form-control" required="required"/>
                        </div>
                        <div class="form-group">
                            <label>Socket Style <span style="color: red;">*</span></label>
                            <select t-model="line.socket_style" class="form-control" required="required">
                                <option value="">Select a style</option>
                                <t t-foreach="socketStyles" t-as="style" t-key="style_index">
                                    <option t-att-value="style.value" t-esc="style.label"/>
                                </t>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Height from Floor (in meters, e.g., 1.2) <span style="color: red;">*</span></label>
                            <input type="number" t-model="line.height_from_floor" class="form-control" min="0.01" step="any" required="required"/>
                        </div>
                        <div class="form-group">
                            <label>Surface or Flush Mounted? <span style="color: red;">*</span></label>
                            <select t-model="line.mount_type" class="form-control" required="required">
                                <option value="">Select...</option>
                                <option value="surface">Surface (on wall)</option>
                                <option value="flush">Flush (in wall)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Flooring Type <span style="color: red;">*</span></label>
                            <select t-model="line.flooring_type" class="form-control" required="required">
                                <option value="">Select...</option>
                                <option value="carpet">Carpet</option>
                                <option value="laminate">Laminate</option>
                                <option value="tile">Tile</option>
                                <option value="wood">Wood</option>
                                <option value="other">Other</option>
                            </select>
                            <div t-if="line.flooring_type === 'other'">
                                <input type="text" t-model="line.flooring_other" class="form-control" placeholder="Describe..."/>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Wall Type (affects installation)</label>
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
                        </div>
                        <div class="form-group">
                            <label>Number of Gangs</label>
                            <select t-model="line.gangs" class="form-control">
                                <option value="">Select...</option>
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="triple">Triple</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Photo of Desired Socket Location</label>
                            <input type="file" t-on-change="(ev) => this.onLocationChange(line_index, ev)" accept="image/*" class="form-control"/>
                            <div t-if="line.location_attachments.length" class="mt-2">
                                <t t-foreach="line.location_attachments" t-as="file" t-key="file_index">
                                    <img t-att-src="file.thumbnail" style="max-width: 100px;"/>
                                    <span t-esc="file.name"/>
                                </t>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Photo/Video of Possible Route &amp; Supply (e.g., from nearest socket/fuseboard)</label>
                            <input type="file" multiple="multiple" t-on-change="(ev) => this.onRouteChange(line_index, ev)" accept="image/*,video/*" class="form-control"/>
                            <p>Tip: Short video tracing the route helps us quote accurately.</p>
                            <div t-if="line.route_attachments.length" class="mt-2">
                                <t t-foreach="line.route_attachments" t-as="file" t-key="file_index">
                                    <t t-if="file.thumbnail">
                                        <img t-att-src="file.thumbnail" style="max-width: 100px;"/>
                                    </t>
                                    <span t-esc="file.name"/>
                                </t>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Additional Comments for this Socket</label>
                            <textarea t-model="line.socket_comments" class="form-control" rows="3" placeholder="Any other details about this socket installation..."/>
                        </div>
                        <button type="button" t-on-click="() => this.removeSocketLine(line_index)" class="btn btn-danger" t-if="state.socket_lines.length > 1">Remove</button>
                    </div>
                    <button type="button" t-on-click="addSocketLine" class="btn btn-secondary">Add Another Socket</button>
                </div>
                <div t-if="state.current_step === state.total_steps &amp;&amp; state.job_type">
                    <h3>Step <t t-esc="state.total_steps"/>: Additional Notes &amp; Attachments</h3>
                    <div class="form-group">
                        <label for="customer_notes">Additional Notes</label>
                        <textarea id="customer_notes" t-model="state.customer_notes" class="form-control" rows="4"/>
                    </div>
                    <div class="form-group">
                        <label for="attachments">Other Relevant Data (Photos, PDFs, Excel, Videos)</label>
                        <input type="file" id="attachments" multiple="multiple" accept="image/*,application/pdf,.xlsx,.xls,video/*" t-on-change="onFileChange" class="form-control"/>
                        <div t-if="state.attachments.length" class="mt-2">
                            <h4>Selected Files [<t t-esc="state.attachments.length"/>]</h4>
                            <ul class="list-unstyled">
                                <t t-foreach="state.attachments" t-as="file" t-key="file_index">
                                    <li class="d-flex align-items-center mb-2">
                                        <t t-if="file.thumbnail">
                                            <img t-att-src="file.thumbnail" alt="Thumbnail" style="max-width: 100px; max-height: 100px; margin-right: 10px;"/>
                                        </t>
                                        <span>
                                            <t t-esc="file.name"/> (<t t-esc="(file.size / 1024 / 1024).toFixed(2)"/> MB)
                                            <t t-if="file.status === 'uploading'"> Uploading... <t t-esc="file.progress"/>%</t>
                                            <t t-if="file.status === 'error'"> Error: <t t-esc="file.errorMsg"/></t>
                                            <button type="button" t-on-click="() => this.removeFile(file_index)" class="btn btn-sm btn-danger ml-2">Remove</button>
                                        </span>
                                    </li>
                                </t>
                            </ul>
                            <p>Total Size: <t t-esc="(state.attachments.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)"/> MB</p>
                        </div>
                    </div>
                </div>
                <div t-if="state.message" t-att-class="state.messageType" class="alert mt-3">
                    <t t-esc="state.message"/>
                </div>
                <div class="form-group mt-3">
                    <button type="button" t-on-click="prevStep" class="btn btn-secondary" t-if="state.current_step > 1">Back</button>
                    <button type="button" t-on-click="nextStep" class="btn btn-primary ml-2" t-if="state.current_step &lt; state.total_steps">Next</button>
                    <button type="submit" class="btn btn-primary ml-2" t-if="state.current_step === state.total_steps &amp;&amp; state.job_type" t-att-disabled="state.isSubmitting">Submit Request</button>
                    <t t-if="state.isSubmitting">
                        <div class="progress mt-2">
                            <div class="progress-bar" role="progressbar" t-att-style="'width: ' + state.uploadProgress + '%'" t-att-aria-valuenow="state.uploadProgress" aria-valuemin="0" aria-valuemax="100"><t t-esc="state.uploadProgress + '%'" /></div>
                        </div>
                    </t>
                    <t t-if="state.job_type === 'new_socket'">
                        <span class="ml-2">[Total Sockets - <t t-esc="state.socket_lines.length"/>]</span>
                    </t>
                </div>
            </form>
        </div>
    `;

    return { template };
});