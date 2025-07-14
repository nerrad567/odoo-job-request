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
                        <label for="first_name">First Name <span style="color: red;">*</span></label>
                        <input type="text" id="first_name" t-model="state.first_name" class="form-control" required="required" autocapitalize="words" t-on-input="(ev) => this.validateField('first_name')" t-on-blur="(ev) => this.validateField('first_name')"/>
                        <small t-if="state.errors.first_name" class="text-danger"><t t-esc="state.errors.first_name"/></small>
                    </div>
                    <div class="form-group">
                        <label for="email">Email <span style="color: red;">*</span></label>
                        <input type="email" id="email" t-model="state.email" class="form-control" required="required" t-on-input="(ev) => this.validateField('email')" t-on-blur="(ev) => this.validateField('email')"/>
                        <small t-if="state.errors.email" class="text-danger"><t t-esc="state.errors.email"/></small>
                    </div>
                    <div class="form-group">
                        <label for="mobile">Mobile</label>
                        <input type="tel" id="mobile" t-model="state.mobile" class="form-control" title="Enter a valid UK mobile number (e.g., 07123 456789 or +447123456789)" t-on-input="(ev) => this.validateField('mobile')"/>
                        <small t-if="state.errors.mobile" class="text-danger"><t t-esc="state.errors.mobile"/></small>
                    </div>
                    <div class="form-group">
                        <label for="postcode">Postcode <span style="color: red;">*</span></label>
                        <input type="text" id="postcode" t-model="state.postcode" class="form-control" required="required" maxlength="10" t-on-blur="validatePostcode" t-on-input="(ev) => this.validateField('postcode')"/>
                        <small t-if="state.errors.postcode" class="text-danger"><t t-esc="state.errors.postcode"/></small>
                    </div>
                    <div class="form-group">
                        <label>Job Type <span style="color: red;">*</span></label>
                        <div class="accordion" id="jobTypeAccordion">
                            <t t-foreach="categories" t-as="cat" t-key="cat.value">
                                <div class="accordion-item">
                                    <h2 t-att-id="'heading_' + cat.value" class="accordion-header">
                                        <button t-att-class="'accordion-button d-flex align-items-center ' + (state.activeCategory === cat.value ? '' : 'collapsed')" type="button" data-bs-toggle="collapse" t-att-data-bs-target="'#collapse_' + cat.value" t-att-aria-expanded="state.activeCategory === cat.value ? 'true' : 'false'" t-att-aria-controls="'collapse_' + cat.value" t-on-click="() => this.toggleCategory(cat.value)">
                                            <i t-att-class="'fa ' + cat.icon + ' fa-lg p-2 me-2'" aria-hidden="true"/>
                                            <t t-esc="cat.label"/>
                                        </button>
                                    </h2>
                                    <div t-att-id="'collapse_' + cat.value" t-att-class="'accordion-collapse collapse ' + (state.activeCategory === cat.value ? 'show' : '')" t-att-aria-labelledby="'heading_' + cat.value" data-bs-parent="#jobTypeAccordion">
                                        <div class="accordion-body">
                                            <div class="row">
                                                <t t-foreach="cat.jobs" t-as="job" t-key="job.value">
                                                    <div class="col-md-4 mb-3">
                                                        <div t-att-class="'card job-type-card position-relative ' + (state.job_type === job.value ? 'active' : '')" t-on-click="() => this.selectJobType(job.value)">
                                                            <div class="card-body text-center">
                                                                <i t-att-class="'fa ' + job.icon + ' fa-3x mb-2'"/>
                                                                <h5 class="card-title font-weight-bold"><t t-esc="job.label"/></h5>
                                                            </div>
                                                            <i t-if="state.job_type === job.value" class="fa fa-check check-icon fa-2x"></i>
                                                        </div>
                                                    </div>
                                                </t>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </t>
                        </div>
                        <small t-if="state.errors.job_type" class="text-danger"><t t-esc="state.errors.job_type"/></small>
                    </div>
                </div>
                <!-- Step 2: Bonding &amp; Grounding for new_socket -->
                <div t-if="state.job_type === 'new_socket' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Bonding &amp; Grounding</h3>
                    <p>Earth Bonding connects metal incoming services to ground for safety. Look for green/yellow wire clamps near valves or meter boxes.</p>
                    <div class="form-group">
                        <label>Water Bond Present? <span style="color: red;">*</span></label>
                        <select t-model="state.water_is_present" class="form-control" required="required">
                            <option value="">Select...</option>
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                        <small t-if="state.errors.water_is_present" class="text-danger"><t t-esc="state.errors.water_is_present"/></small>
                        <div t-if="state.water_is_present === 'true'">
                            <label>Location Description</label>
                            <input type="text" t-model="state.water_installation_location" class="form-control" placeholder="e.g., Under kitchen sink"/>
                            <label>Photo</label>
                            <input type="file" t-on-change="onWaterPhotoChange" accept="image/*" class="form-control"/>
                            <div t-if="state.water_photo_attachment" class="mt-2 d-flex flex-wrap">
                                <div class="m-1">
                                    <img t-att-src="state.water_photo_attachment.thumbnail || ''" style="max-width: 100px;"/>
                                    <span t-esc="state.water_photo_attachment.name"/>
                                    <button type="button" t-on-click="removeWaterPhoto" class="btn btn-sm btn-danger ml-2">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Similar for gas_is_present, gas_installation_location, gas_photo_attachment, etc. (refactor to match controller keys: data.get('gas_is_present', False)) -->
                    <!-- ... (update all bonding fields to match: oil_is_present, other_services_is_present, etc.) -->
                </div>
                <!-- Step 3: Fuse Board Details for new_socket -->
                <div t-if="state.job_type === 'new_socket' &amp;&amp; state.current_step === 3">
                    <h3>Step 3: Fuse Board Details</h3>
                    <p>These details help us assess safety and pricing accurately.</p>
                    <div class="form-group">
                        <label>Property Type <span style="color: red;">*</span></label>
                        <select t-model="state.building_type" class="form-control" required="required" t-on-change="() => this.validateField('building_type')">
                            <option value="">Select...</option>
                            <option value="house">House</option>
                            <option value="flat">Flat/Apartment</option>
                            <option value="other">Other</option>
                        </select>
                        <small t-if="state.errors.building_type" class="text-danger"><t t-esc="state.errors.building_type"/></small>
                    </div>
                    <div class="form-group">
                        <label>Property Age <span style="color: red;">*</span></label>
                        <select t-model="state.construction_age" class="form-control" required="required" t-on-change="() => this.validateField('construction_age')">
                            <option value="">Select...</option>
                            <option value="pre1950">Before 1950</option>
                            <option value="1950-1980">1950-1980</option>
                            <option value="post1980">After 1980</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                        <small t-if="state.errors.construction_age" class="text-danger"><t t-esc="state.errors.construction_age"/></small>
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
                        <input type="file" id="fuse_board_photo_attachment" t-on-change="onFuseBoardChange" accept="image/*" class="form-control" required="required"/>
                        <small class="form-text text-muted">A clear photo of your fuse board helps us assess capacity.</small>
                        <div t-if="state.fuse_board_photo_attachment" class="mt-2 d-flex flex-wrap">
                            <div class="m-1">
                                <img t-att-src="state.fuse_board_photo_attachment.thumbnail || ''" style="max-width: 100px;"/>
                                <span t-esc="state.fuse_board_photo_attachment.name"/>
                                <button type="button" t-on-click="removeFuseBoardPhoto" class="btn btn-sm btn-danger ml-2">Remove</button>
                            </div>
                        </div>
                        <small t-if="state.errors.fuse_board_photo_attachment" class="text-danger"><t t-esc="state.errors.fuse_board_photo_attachment"/></small>
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
                </div>
                <!-- Step 4: Socket Details for new_socket -->
                <div t-if="state.job_type === 'new_socket' &amp;&amp; state.current_step === 4">
                    <h3>Step 4: Socket Details [Total: <t t-esc="state.new_socket_installations.length"/>]</h3>
                    <p>Specify details for each socket to ensure accurate pricing.</p>
                    <div class="form-group">
                        <label>Number of Sockets <span style="color: red;">*</span></label>
                        <input type="number" t-model.number="state.num_sockets" min="1" class="form-control" t-on-change="prepopulateSockets" required="required"/>
                        <small class="form-text text-muted">Enter the number of sockets to prefill the form below.</small>
                        <small t-if="state.errors.num_sockets" class="text-danger"><t t-esc="state.errors.num_sockets"/></small>
                    </div>
                    <div t-foreach="state.new_socket_installations" t-as="line" t-key="line_index" class="socket-line mb-3 border p-3">
                        <h5>Socket <t t-esc="line_index + 1"/></h5>
                        <div class="form-group">
                            <label>Room Name <span style="color: red;">*</span></label>
                            <input type="text" t-model="line.room_name" class="form-control" required="required" placeholder="e.g., Living Room"/>
                        </div>
                        <div class="form-group">
                            <label>Socket Style <span style="color: red;">*</span></label>
                            <select t-model="line.socket_style" class="form-control" required="required">
                                <option value="">Select...</option>
                                <t t-foreach="socketStyles" t-as="style" t-key="style_index">
                                    <option t-att-value="style.value" t-esc="style.label"/>
                                </t>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Height from Floor (m) <span style="color: red;">*</span></label>
                            <input type="number" t-model.number="line.installation_height_from_floor" class="form-control" min="0.01" step="any" required="required" placeholder="e.g., 0.3"/>
                            <small class="form-text text-muted">Typical height is 0.3m for standard sockets.</small>
                        </div>
                        <div class="form-group">
                            <label>Mount Type <span style="color: red;">*</span></label>
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
                            <input type="file" t-on-change="(ev) => this.onLocationChange(line_index, ev)" accept="image/*" class="form-control"/>
                            <small class="form-text text-muted">Upload a photo showing where the socket will be placed.</small>
                            <div t-if="line.location_photo_attachments.length" class="mt-2 d-flex flex-wrap">
                                <t t-foreach="line.location_photo_attachments" t-as="file" t-key="file_index">
                                    <div class="m-1">
                                        <img t-att-src="file.thumbnail || ''" style="max-width: 100px;"/>
                                        <span t-esc="file.name"/>
                                        <button type="button" t-on-click="() => this.removeLocationAttachment(line_index, file_index)" class="btn btn-sm btn-danger ml-2">Remove</button>
                                    </div>
                                </t>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Photo/Video of Route &amp; Supply</label>
                            <input type="file" multiple="multiple" t-on-change="(ev) => this.onRouteChange(line_index, ev)" accept="image/*,video/*" class="form-control"/>
                            <small class="form-text text-muted">Tip: A short video tracing the route from the nearest socket or fuse board helps us quote accurately.</small>
                            <div t-if="line.route_photo_or_video_attachments.length" class="mt-2 d-flex flex-wrap">
                                <t t-foreach="line.route_photo_or_video_attachments" t-as="file" t-key="file_index">
                                    <div class="m-1">
                                        <t t-if="file.thumbnail">
                                            <img t-att-src="file.thumbnail || ''" style="max-width: 100px;"/>
                                        </t>
                                        <span t-esc="file.name"/>
                                        <button type="button" t-on-click="() => this.removeRouteAttachment(line_index, file_index)" class="btn btn-sm btn-danger ml-2">Remove</button>
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
                </div>
                <!-- Step 5: Anything Else? for new_socket -->
                <div t-if="state.job_type === 'new_socket' &amp;&amp; state.current_step === 5">
                    <h3>Step 5: Anything Else?</h3>
                    <div class="form-group">
                        <label for="additional_notes">Additional Notes</label>
                        <textarea id="additional_notes" t-model="state.additional_notes" class="form-control" rows="4" placeholder="Any other details or special requirements..."/>
                    </div>
                    <div class="form-group">
                        <label for="general_site_video_attachments">General Site Videos</label>
                        <input type="file" id="general_site_video_attachments" multiple="multiple" accept="video/*" t-on-change="onGeneralVideoChange" class="form-control"/>
                        <small class="form-text text-muted">Upload any general site videos.</small>
                        <div t-if="state.general_site_video_attachments.length" class="mt-2">
                            <ul class="list-unstyled">
                                <t t-foreach="state.general_site_video_attachments" t-as="file" t-key="file_index">
                                    <li class="d-flex align-items-center mb-2">
                                        <span>
                                            <t t-esc="file.name"/> (<t t-esc="(file.size / 1024 / 1024).toFixed(2)"/> MB)
                                            <button type="button" t-on-click="() => this.removeGeneralVideo(file_index)" class="btn btn-sm btn-danger ml-2">Remove</button>
                                        </span>
                                    </li>
                                </t>
                            </ul>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="unknown_attachment">Unknown Attachment</label>
                        <input type="file" id="unknown_attachment" t-on-change="onUnknownAttachmentChange" class="form-control"/>
                        <div t-if="state.unknown_attachment" class="mt-2">
                            <span t-esc="state.unknown_attachment.name"/>
                            <button type="button" t-on-click="removeUnknownAttachment" class="btn btn-sm btn-danger ml-2">Remove</button>
                        </div>
                    </div>
                </div>
                <!-- Bonding &amp; Grounding for other relevant job types in step 3 (update keys to match controller, e.g., 'does_building_contain_asbestos') -->
                <div t-if="state.job_type in ['additional_circuit', 'outbuilding_power', 'ev_charger', 'full_rewire', 'partial_rewire', 'dado_trunking', 'industrial_rewire', 'minor_works', 'structured_cabling', 'ethernet_point'] &amp;&amp; state.current_step === 3">
                    <h3>Step 3: Bonding &amp; Grounding</h3>
                    <p>Earth Bonding connects metal incoming services to ground for safety. Look for green/yellow wire clamps near valves or meter boxes.</p>
                    <!-- ... (update t-model to 'water_is_present', 'gas_is_present', etc., matching controller data.get) -->
                </div>
                <!-- Placeholder steps for other job types (complete with specific fields matching controller, e.g., for 'ev_charger' add 'power_rating', 'installation_location', 'ev_attachments') -->
                <div t-if="state.job_type === 'ev_charger' &amp;&amp; state.current_step === 2">
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
                        <input type="file" multiple="multiple" t-on-change="onEvAttachmentsChange" accept="image/*,video/*" class="form-control"/>
                        <div t-if="state.ev_attachments.length" class="mt-2 d-flex flex-wrap">
                            <t t-foreach="state.ev_attachments" t-as="file" t-key="file_index">
                                <div class="m-1">
                                    <img t-att-src="file.thumbnail || ''" style="max-width: 100px;"/>
                                    <span t-esc="file.name"/>
                                    <button type="button" t-on-click="() => this.removeEvAttachment(file_index)" class="btn btn-sm btn-danger ml-2">Remove</button>
                                </div>
                            </t>
                        </div>
                    </div>
                </div>
                <!-- ... (add similar for all 35 job_types, with fields matching controller data.get, e.g., 'building_type' for property_details) -->
                <!-- Final step for other job types -->
                <div t-if="state.current_step === state.total_steps &amp;&amp; state.job_type &amp;&amp; state.job_type !== 'new_socket'">
                    <h3>Step <t t-esc="state.total_steps"/>: Additional Notes &amp; Attachments</h3>
                    <div class="form-group">
                        <label for="additional_notes">Additional Notes</label>
                        <textarea id="additional_notes" t-model="state.additional_notes" class="form-control" rows="4" placeholder="Any other details or special requirements..."/>
                    </div>
                    <div class="form-group">
                        <label for="general_site_video_attachments">General Site Videos</label>
                        <input type="file" id="general_site_video_attachments" multiple="multiple" accept="video/*" t-on-change="onGeneralVideoChange" class="form-control"/>
                        <small class="form-text text-muted">Upload any general site videos.</small>
                        <div t-if="state.general_site_video_attachments.length" class="mt-2">
                            <ul class="list-unstyled">
                                <t t-foreach="state.general_site_video_attachments" t-as="file" t-key="file_index">
                                    <li class="d-flex align-items-center mb-2">
                                        <span>
                                            <t t-esc="file.name"/> (<t t-esc="(file.size / 1024 / 1024).toFixed(2)"/> MB)
                                            <button type="button" t-on-click="() => this.removeGeneralVideo(file_index)" class="btn btn-sm btn-danger ml-2">Remove</button>
                                        </span>
                                    </li>
                                </t>
                            </ul>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="unknown_attachment">Unknown Attachment</label>
                        <input type="file" id="unknown_attachment" t-on-change="onUnknownAttachmentChange" class="form-control"/>
                        <div t-if="state.unknown_attachment" class="mt-2">
                            <span t-esc="state.unknown_attachment.name"/>
                            <button type="button" t-on-click="removeUnknownAttachment" class="btn btn-sm btn-danger ml-2">Remove</button>
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
                </div>
            </form>
        </div>
    `;

    return { template };
});