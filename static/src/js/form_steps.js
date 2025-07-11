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
                        <select t-model="state.water_bond" class="form-control" required="required">
                            <option value="">Select...</option>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                        <small t-if="state.errors.water_bond" class="text-danger"><t t-esc="state.errors.water_bond"/></small>
                        <div t-if="state.water_bond === 'yes'">
                            <label>Location Description</label>
                            <input type="text" t-model="state.water_bond_location" class="form-control" placeholder="e.g., Under kitchen sink"/>
                            <label>Photo</label>
                            <input type="file" t-on-change="onWaterBondPhotoChange" accept="image/*" class="form-control"/>
                            <div t-if="state.water_bond_attachment" class="mt-2 d-flex flex-wrap">
                                <div class="m-1">
                                    <img t-att-src="state.water_bond_attachment.thumbnail || ''" style="max-width: 100px;"/>
                                    <span t-esc="state.water_bond_attachment.name"/>
                                    <button type="button" t-on-click="() => this.state.water_bond_attachment = null" class="btn btn-sm btn-danger ml-2">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Gas Bond Present? <span style="color: red;">*</span></label>
                        <select t-model="state.gas_bond" class="form-control" required="required">
                            <option value="">Select...</option>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                        <small t-if="state.errors.gas_bond" class="text-danger"><t t-esc="state.errors.gas_bond"/></small>
                        <div t-if="state.gas_bond === 'yes'">
                            <label>Location Description</label>
                            <input type="text" t-model="state.gas_bond_location" class="form-control" placeholder="e.g., Near gas meter"/>
                            <label>Photo</label>
                            <input type="file" t-on-change="onGasBondPhotoChange" accept="image/*" class="form-control"/>
                            <div t-if="state.gas_bond_attachment" class="mt-2 d-flex flex-wrap">
                                <div class="m-1">
                                    <img t-att-src="state.gas_bond_attachment.thumbnail || ''" style="max-width: 100px;"/>
                                    <span t-esc="state.gas_bond_attachment.name"/>
                                    <button type="button" t-on-click="() => this.state.gas_bond_attachment = null" class="btn btn-sm btn-danger ml-2">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Oil Bond Present? <span style="color: red;">*</span></label>
                        <select t-model="state.oil_bond" class="form-control" required="required">
                            <option value="">Select...</option>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                        <small t-if="state.errors.oil_bond" class="text-danger"><t t-esc="state.errors.oil_bond"/></small>
                        <div t-if="state.oil_bond === 'yes'">
                            <label>Location Description</label>
                            <input type="text" t-model="state.oil_bond_location" class="form-control" placeholder="e.g., Near oil tank"/>
                            <label>Photo</label>
                            <input type="file" t-on-change="onOilBondPhotoChange" accept="image/*" class="form-control"/>
                            <div t-if="state.oil_bond_attachment" class="mt-2 d-flex flex-wrap">
                                <div class="m-1">
                                    <img t-att-src="state.oil_bond_attachment.thumbnail || ''" style="max-width: 100px;"/>
                                    <span t-esc="state.oil_bond_attachment.name"/>
                                    <button type="button" t-on-click="() => this.state.oil_bond_attachment = null" class="btn btn-sm btn-danger ml-2">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Other Buried Services or Steel Work? <span style="color: red;">*</span></label>
                        <select t-model="state.other_services" class="form-control" required="required">
                            <option value="">Select...</option>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                        <small t-if="state.errors.other_services" class="text-danger"><t t-esc="state.errors.other_services"/></small>
                        <div t-if="state.other_services === 'yes'">
                            <label>Description</label>
                            <textarea t-model="state.other_services_desc" class="form-control" placeholder="Describe any underground cables or steel structures..."/>
                            <label>Photo</label>
                            <input type="file" t-on-change="onOtherServicesPhotoChange" accept="image/*" class="form-control"/>
                            <div t-if="state.other_services_attachment" class="mt-2 d-flex flex-wrap">
                                <div class="m-1">
                                    <img t-att-src="state.other_services_attachment.thumbnail || ''" style="max-width: 100px;"/>
                                    <span t-esc="state.other_services_attachment.name"/>
                                    <button type="button" t-on-click="() => this.state.other_services_attachment = null" class="btn btn-sm btn-danger ml-2">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Step 3: Fuse Board Details for new_socket -->
                <div t-if="state.job_type === 'new_socket' &amp;&amp; state.current_step === 3">
                    <h3>Step 3: Fuse Board Details</h3>
                    <p>These details help us assess safety and pricing accurately.</p>
                    <div class="form-group">
                        <label>Property Type <span style="color: red;">*</span></label>
                        <select t-model="state.property_type" class="form-control" required="required" t-on-change="() => this.validateField('property_type')">
                            <option value="">Select...</option>
                            <option value="house">House</option>
                            <option value="flat">Flat/Apartment</option>
                            <option value="other">Other</option>
                        </select>
                        <small t-if="state.errors.property_type" class="text-danger"><t t-esc="state.errors.property_type"/></small>
                    </div>
                    <div class="form-group">
                        <label>Property Age <span style="color: red;">*</span></label>
                        <select t-model="state.property_age" class="form-control" required="required" t-on-change="() => this.validateField('property_age')">
                            <option value="">Select...</option>
                            <option value="pre1950">Before 1950</option>
                            <option value="1950-1980">1950-1980</option>
                            <option value="post1980">After 1980</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                        <small t-if="state.errors.property_age" class="text-danger"><t t-esc="state.errors.property_age"/></small>
                    </div>
                    <div class="form-group">
                        <label>Loft Access Available?</label>
                        <select t-model="state.attic_access" class="form-control">
                            <option value="">Select...</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Photo of Fuse Board <span style="color: red;">*</span></label>
                        <input type="file" id="fuse_board" t-on-change="onFuseBoardChange" accept="image/*" class="form-control" required="required"/>
                        <small class="form-text text-muted">A clear photo of your fuse board helps us assess capacity.</small>
                        <div t-if="state.fuse_board_attachment" class="mt-2 d-flex flex-wrap">
                            <div class="m-1">
                                <img t-att-src="state.fuse_board_attachment.thumbnail || ''" style="max-width: 100px;"/>
                                <span t-esc="state.fuse_board_attachment.name"/>
                                <button type="button" t-on-click="() => this.state.fuse_board_attachment = null" class="btn btn-sm btn-danger ml-2">Remove</button>
                            </div>
                        </div>
                        <small t-if="state.errors.fuse_board" class="text-danger"><t t-esc="state.errors.fuse_board"/></small>
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
                        <label>Recent Electrical Upgrades?</label>
                        <input type="text" t-model="state.recent_upgrades" class="form-control" placeholder="e.g., New panel in 2020"/>
                    </div>
                </div>
                <!-- Step 4: Socket Details for new_socket -->
                <div t-if="state.job_type === 'new_socket' &amp;&amp; state.current_step === 4">
                    <h3>Step 4: Socket Details [Total: <t t-esc="state.socket_lines.length"/>]</h3>
                    <p>Specify details for each socket to ensure accurate pricing.</p>
                    <div class="form-group">
                        <label>Number of Sockets <span style="color: red;">*</span></label>
                        <input type="number" t-model.number="state.num_sockets" min="1" class="form-control" t-on-change="prepopulateSockets" required="required"/>
                        <small class="form-text text-muted">Enter the number of sockets to prefill the form below.</small>
                        <small t-if="state.errors.num_sockets" class="text-danger"><t t-esc="state.errors.num_sockets"/></small>
                    </div>
                    <div t-foreach="state.socket_lines" t-as="line" t-key="line_index" class="socket-line mb-3 border p-3">
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
                            <input type="number" t-model.number="line.height_from_floor" class="form-control" min="0.01" step="any" required="required" placeholder="e.g., 0.3"/>
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
                                <input type="text" t-model="line.flooring_other" class="form-control" placeholder="Describe..."/>
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
                            <select t-model="line.gangs" class="form-control">
                                <option value="">Select...</option>
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="triple">Triple</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Photo of Desired Location</label>
                            <input type="file" t-on-change="(ev) => this.onLocationChange(line_index, ev)" accept="image/*" class="form-control"/>
                            <small class="form-text text-muted">Upload a photo showing where the socket will be placed.</small>
                            <div t-if="line.location_attachments.length" class="mt-2 d-flex flex-wrap">
                                <t t-foreach="line.location_attachments" t-as="file" t-key="file_index">
                                    <div class="m-1">
                                        <img t-att-src="file.thumbnail || ''" style="max-width: 100px;"/>
                                        <span t-esc="file.name"/>
                                        <button type="button" t-on-click="() => this.state.socket_lines[line_index].location_attachments.splice(file_index, 1)" class="btn btn-sm btn-danger ml-2">Remove</button>
                                    </div>
                                </t>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Photo/Video of Route &amp; Supply</label>
                            <input type="file" multiple="multiple" t-on-change="(ev) => this.onRouteChange(line_index, ev)" accept="image/*,video/*" class="form-control"/>
                            <small class="form-text text-muted">Tip: A short video tracing the route from the nearest socket or fuse board helps us quote accurately.</small>
                            <div t-if="line.route_attachments.length" class="mt-2 d-flex flex-wrap">
                                <t t-foreach="line.route_attachments" t-as="file" t-key="file_index">
                                    <div class="m-1">
                                        <t t-if="file.thumbnail">
                                            <img t-att-src="file.thumbnail || ''" style="max-width: 100px;"/>
                                        </t>
                                        <span t-esc="file.name"/>
                                        <button type="button" t-on-click="() => this.state.socket_lines[line_index].route_attachments.splice(file_index, 1)" class="btn btn-sm btn-danger ml-2">Remove</button>
                                    </div>
                                </t>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Additional Comments</label>
                            <textarea t-model="line.socket_comments" class="form-control" rows="3" placeholder="Any specific requirements for this socket..."/>
                        </div>
                        <button type="button" t-on-click="() => this.removeSocketLine(line_index)" class="btn btn-danger" t-if="state.socket_lines.length > 1">Remove Socket</button>
                    </div>
                    <button type="button" t-on-click="addSocketLine" class="btn btn-secondary mt-3">Add Another Socket</button>
                </div>
                <!-- Step 5: Anything Else? for new_socket -->
                <div t-if="state.job_type === 'new_socket' &amp;&amp; state.current_step === 5">
                    <h3>Step 5: Anything Else?</h3>
                    <div class="form-group">
                        <label for="customer_notes">Additional Notes</label>
                        <textarea id="customer_notes" t-model="state.customer_notes" class="form-control" rows="4" placeholder="Any other details or special requirements..."/>
                    </div>
                    <div class="form-group">
                        <label for="attachments">Other Relevant Data (Photos, PDFs, Excel, Videos)</label>
                        <input type="file" id="attachments" multiple="multiple" accept="image/*,application/pdf,.xlsx,.xls,video/*" t-on-change="onFileChange" class="form-control"/>
                        <small class="form-text text-muted">Upload any additional files relevant to your request.</small>
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
                <!-- Bonding &amp; Grounding for other relevant job types in step 3 -->
                <div t-if="state.job_type in ['additional_circuit', 'outbuilding_power', 'ev_charger', 'full_rewire', 'partial_rewire', 'dado_trunking', 'industrial_rewire', 'minor_works', 'structured_cabling', 'ethernet_point'] &amp;&amp; state.current_step === 3">
                    <h3>Step 3: Bonding &amp; Grounding</h3>
                    <p>Earth Bonding connects metal incoming services to ground for safety. Look for green/yellow wire clamps near valves or meter boxes.</p>
                    <div class="form-group">
                        <label>Water Bond Present? <span style="color: red;">*</span></label>
                        <select t-model="state.water_bond" class="form-control" required="required">
                            <option value="">Select...</option>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                        <small t-if="state.errors.water_bond" class="text-danger"><t t-esc="state.errors.water_bond"/></small>
                        <div t-if="state.water_bond === 'yes'">
                            <label>Location Description</label>
                            <input type="text" t-model="state.water_bond_location" class="form-control" placeholder="e.g., Under kitchen sink"/>
                            <label>Photo</label>
                            <input type="file" t-on-change="onWaterBondPhotoChange" accept="image/*" class="form-control"/>
                            <div t-if="state.water_bond_attachment" class="mt-2 d-flex flex-wrap">
                                <div class="m-1">
                                    <img t-att-src="state.water_bond_attachment.thumbnail || ''" style="max-width: 100px;"/>
                                    <span t-esc="state.water_bond_attachment.name"/>
                                    <button type="button" t-on-click="() => this.state.water_bond_attachment = null" class="btn btn-sm btn-danger ml-2">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Gas Bond Present? <span style="color: red;">*</span></label>
                        <select t-model="state.gas_bond" class="form-control" required="required">
                            <option value="">Select...</option>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                        <small t-if="state.errors.gas_bond" class="text-danger"><t t-esc="state.errors.gas_bond"/></small>
                        <div t-if="state.gas_bond === 'yes'">
                            <label>Location Description</label>
                            <input type="text" t-model="state.gas_bond_location" class="form-control" placeholder="e.g., Near gas meter"/>
                            <label>Photo</label>
                            <input type="file" t-on-change="onGasBondPhotoChange" accept="image/*" class="form-control"/>
                            <div t-if="state.gas_bond_attachment" class="mt-2 d-flex flex-wrap">
                                <div class="m-1">
                                    <img t-att-src="state.gas_bond_attachment.thumbnail || ''" style="max-width: 100px;"/>
                                    <span t-esc="state.gas_bond_attachment.name"/>
                                    <button type="button" t-on-click="() => this.state.gas_bond_attachment = null" class="btn btn-sm btn-danger ml-2">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Oil Bond Present? <span style="color: red;">*</span></label>
                        <select t-model="state.oil_bond" class="form-control" required="required">
                            <option value="">Select...</option>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                        <small t-if="state.errors.oil_bond" class="text-danger"><t t-esc="state.errors.oil_bond"/></small>
                        <div t-if="state.oil_bond === 'yes'">
                            <label>Location Description</label>
                            <input type="text" t-model="state.oil_bond_location" class="form-control" placeholder="e.g., Near oil tank"/>
                            <label>Photo</label>
                            <input type="file" t-on-change="onOilBondPhotoChange" accept="image/*" class="form-control"/>
                            <div t-if="state.oil_bond_attachment" class="mt-2 d-flex flex-wrap">
                                <div class="m-1">
                                    <img t-att-src="state.oil_bond_attachment.thumbnail || ''" style="max-width: 100px;"/>
                                    <span t-esc="state.oil_bond_attachment.name"/>
                                    <button type="button" t-on-click="() => this.state.oil_bond_attachment = null" class="btn btn-sm btn-danger ml-2">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Other Buried Services or Steel Work? <span style="color: red;">*</span></label>
                        <select t-model="state.other_services" class="form-control" required="required">
                            <option value="">Select...</option>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                            <option value="unknown">Not Sure</option>
                        </select>
                        <small t-if="state.errors.other_services" class="text-danger"><t t-esc="state.errors.other_services"/></small>
                        <div t-if="state.other_services === 'yes'">
                            <label>Description</label>
                            <textarea t-model="state.other_services_desc" class="form-control" placeholder="Describe any underground cables or steel structures..."/>
                            <label>Photo</label>
                            <input type="file" t-on-change="onOtherServicesPhotoChange" accept="image/*" class="form-control"/>
                            <div t-if="state.other_services_attachment" class="mt-2 d-flex flex-wrap">
                                <div class="m-1">
                                    <img t-att-src="state.other_services_attachment.thumbnail || ''" style="max-width: 100px;"/>
                                    <span t-esc="state.other_services_attachment.name"/>
                                    <button type="button" t-on-click="() => this.state.other_services_attachment = null" class="btn btn-sm btn-danger ml-2">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Placeholder steps for other job types -->
                <div t-if="state.job_type === 'additional_circuit' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Additional Circuit Details</h3>
                    <p>Placeholder: What appliance will use this circuit?</p>
                    <input type="text" t-model="state.appliance_type" class="form-control" />
                </div>
                <div t-if="state.job_type === 'outbuilding_power' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Outbuilding Power Details</h3>
                    <p>Placeholder: Type of outbuilding (shed/garage)?</p>
                    <select t-model="state.outbuilding_type" class="form-control">
                        <option value="shed">Shed</option>
                        <option value="garage">Garage</option>
                    </select>
                </div>
                <div t-if="state.job_type === 'ev_charger' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: EV Charger Details</h3>
                    <p>Placeholder: Charger power rating?</p>
                    <input type="text" t-model="state.ev_power_rating" class="form-control" />
                </div>
                <div t-if="state.job_type === 'new_light' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: New Light Details</h3>
                    <p>Placeholder: Indoor or outdoor?</p>
                    <select t-model="state.light_location" class="form-control">
                        <option value="indoor">Indoor</option>
                        <option value="outdoor">Outdoor</option>
                    </select>
                </div>
                <div t-if="state.job_type === 'downlights' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Downlights Details</h3>
                    <p>Placeholder: Number of downlights?</p>
                    <input type="number" t-model="state.downlights_count" class="form-control" />
                </div>
                <div t-if="state.job_type === 'smart_lighting' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Smart Lighting Details</h3>
                    <p>Placeholder: Compatible with Alexa/Google?</p>
                    <input type="text" t-model="state.smart_compatibility" class="form-control" />
                </div>
                <div t-if="state.job_type === 'outdoor_lighting' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Outdoor Lighting Details</h3>
                    <p>Placeholder: Motion sensor required?</p>
                    <select t-model="state.motion_sensor" class="form-control">
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>
                <div t-if="state.job_type === 'dimmer_install' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Dimmer Install Details</h3>
                    <p>Placeholder: Number of dimmers?</p>
                    <input type="number" t-model="state.dimmer_count" class="form-control" />
                </div>
                <div t-if="state.job_type === 'consumer_unit' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Consumer Unit Details</h3>
                    <p>Placeholder: Current unit type?</p>
                    <input type="text" t-model="state.current_unit_type" class="form-control" />
                </div>
                <div t-if="state.job_type === 'rccb_install' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: RCCB Install Details</h3>
                    <p>Placeholder: For which circuit?</p>
                    <input type="text" t-model="state.rccb_circuit" class="form-control" />
                </div>
                <div t-if="state.job_type === 'surge_protection' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Surge Protection Details</h3>
                    <p>Placeholder: Whole house or specific devices?</p>
                    <select t-model="state.surge_scope" class="form-control">
                        <option value="whole">Whole House</option>
                        <option value="specific">Specific Devices</option>
                    </select>
                </div>
                <div t-if="state.job_type === 'eicr' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: EICR Details</h3>
                    <p>Placeholder: Property size?</p>
                    <input type="text" t-model="state.property_size" class="form-control" />
                </div>
                <div t-if="state.job_type === 'smoke_alarms' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Smoke Alarms Details</h3>
                    <p>Placeholder: Number of alarms?</p>
                    <input type="number" t-model="state.alarms_count" class="form-control" />
                </div>
                <div t-if="state.job_type === 'earthing_bonding' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Earthing Bonding Details</h3>
                    <p>Placeholder: Current bonding status?</p>
                    <input type="text" t-model="state.bonding_status" class="form-control" />
                </div>
                <div t-if="state.job_type === 'fixed_wire_testing' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Fixed Wire Testing Details</h3>
                    <p>Placeholder: Last test date?</p>
                    <input type="date" t-model="state.last_test_date" class="form-control" />
                </div>
                <div t-if="state.job_type === 'emergency_lighting' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Emergency Lighting Details</h3>
                    <p>Placeholder: Commercial or residential?</p>
                    <select t-model="state.emergency_type" class="form-control">
                        <option value="commercial">Commercial</option>
                        <option value="residential">Residential</option>
                    </select>
                </div>
                <div t-if="state.job_type === 'full_rewire' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Full Rewire Details</h3>
                    <p>Placeholder: Number of rooms?</p>
                    <input type="number" t-model="state.rooms_count" class="form-control" />
                </div>
                <div t-if="state.job_type === 'partial_rewire' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Partial Rewire Details</h3>
                    <p>Placeholder: Which rooms?</p>
                    <input type="text" t-model="state.partial_rooms" class="form-control" />
                </div>
                <div t-if="state.job_type === 'dado_trunking' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Dado Trunking Details</h3>
                    <p>Placeholder: Length in meters?</p>
                    <input type="number" t-model="state.trunking_length" class="form-control" />
                </div>
                <div t-if="state.job_type === 'industrial_rewire' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Industrial Rewire Details</h3>
                    <p>Placeholder: Facility size?</p>
                    <input type="text" t-model="state.facility_size" class="form-control" />
                </div>
                <div t-if="state.job_type === 'minor_works' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Minor Works Details</h3>
                    <p>Placeholder: Description of works?</p>
                    <textarea t-model="state.minor_description" class="form-control"></textarea>
                </div>
                <div t-if="state.job_type === 'fault_finding' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Fault Finding Details</h3>
                    <p>Placeholder: Symptoms observed?</p>
                    <textarea t-model="state.fault_symptoms" class="form-control"></textarea>
                </div>
                <div t-if="state.job_type === 'structured_cabling' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Structured Cabling Details</h3>
                    <p>Placeholder: Cable type?</p>
                    <input type="text" t-model="state.cable_type" class="form-control" />
                </div>
                <div t-if="state.job_type === 'ethernet_point' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Ethernet Point Details</h3>
                    <p>Placeholder: Number of points?</p>
                    <input type="number" t-model="state.ethernet_points" class="form-control" />
                </div>
                <div t-if="state.job_type === 'wifi_booster' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: WiFi Booster Details</h3>
                    <p>Placeholder: Coverage area?</p>
                    <input type="text" t-model="state.coverage_area" class="form-control" />
                </div>
                <div t-if="state.job_type === 'electric_shower' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Electric Shower Details</h3>
                    <p>Placeholder: Power rating?</p>
                    <input type="text" t-model="state.shower_power" class="form-control" />
                </div>
                <div t-if="state.job_type === 'underfloor_heating' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Underfloor Heating Details</h3>
                    <p>Placeholder: Area in sqm?</p>
                    <input type="number" t-model="state.heating_area" class="form-control" />
                </div>
                <div t-if="state.job_type === 'heating_controls' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Heating Controls Details</h3>
                    <p>Placeholder: Thermostat type?</p>
                    <input type="text" t-model="state.thermostat_type" class="form-control" />
                </div>
                <div t-if="state.job_type === 'smart_heating_controls' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Smart Heating Controls Details</h3>
                    <p>Placeholder: Integration platform?</p>
                    <input type="text" t-model="state.integration_platform" class="form-control" />
                </div>
                <div t-if="state.job_type === 'smart_hub' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Smart Hub Details</h3>
                    <p>Placeholder: Hub brand?</p>
                    <input type="text" t-model="state.hub_brand" class="form-control" />
                </div>
                <div t-if="state.job_type === 'knx_system' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: KNX System Details</h3>
                    <p>Placeholder: Number of devices?</p>
                    <input type="number" t-model="state.knx_devices" class="form-control" />
                </div>
                <div t-if="state.job_type === 'home_automation_panel' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Automation Panel Details</h3>
                    <p>Placeholder: Panel location?</p>
                    <input type="text" t-model="state.panel_location" class="form-control" />
                </div>
                <div t-if="state.job_type === 'access_control' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Access Control Details</h3>
                    <p>Placeholder: Number of doors?</p>
                    <input type="number" t-model="state.doors_count" class="form-control" />
                </div>
                <div t-if="state.job_type === 'cctv' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: CCTV Details</h3>
                    <p>Placeholder: Number of cameras?</p>
                    <input type="number" t-model="state.cameras_count" class="form-control" />
                </div>
                <div t-if="state.job_type === 'automated_gates' &amp;&amp; state.current_step === 2">
                    <h3>Step 2: Automated Gates Details</h3>
                    <p>Placeholder: Gate type?</p>
                    <input type="text" t-model="state.gate_type" class="form-control" />
                </div>
                <!-- Placeholder for other job types in step 3 -->
                <div t-if="state.job_type === 'new_light' &amp;&amp; state.current_step === 3">
                    <h3>Step 3: Lighting Bonding</h3>
                    <p>Placeholder: Lighting-specific bonding question?</p>
                    <input type="text" t-model="state.lighting_bonding" class="form-control" />
                </div>
                <div t-if="state.job_type === 'smart_lighting' &amp;&amp; state.current_step === 3">
                    <h3>Step 3: Smart Lighting Integration</h3>
                    <p>Placeholder: Compatible systems?</p>
                    <input type="text" t-model="state.smart_systems" class="form-control" />
                </div>
                <!-- Placeholder for other job types in step 4 -->
                <div t-if="state.job_type in ['additional_circuit', 'outbuilding_power', 'ev_charger', 'full_rewire', 'partial_rewire', 'dado_trunking', 'industrial_rewire', 'minor_works', 'structured_cabling', 'ethernet_point'] &amp;&amp; state.current_step === 4">
                    <h3>Step 4: Socket Details [Total: <t t-esc="state.socket_lines.length"/>]</h3>
                    <p>Placeholder: Specify socket details (to be customized).</p>
                    <div class="form-group">
                        <label>Number of Sockets <span style="color: red;">*</span></label>
                        <input type="number" t-model.number="state.num_sockets" min="1" class="form-control" t-on-change="prepopulateSockets" required="required"/>
                        <small t-if="state.errors.num_sockets" class="text-danger"><t t-esc="state.errors.num_sockets"/></small>
                    </div>
                    <div t-foreach="state.socket_lines" t-as="line" t-key="line_index" class="socket-line mb-3 border p-3">
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
                            <input type="number" t-model.number="line.height_from_floor" class="form-control" min="0.01" step="any" required="required" placeholder="e.g., 0.3"/>
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
                                <input type="text" t-model="line.flooring_other" class="form-control" placeholder="Describe..."/>
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
                            <label>Photo of Desired Location</label>
                            <input type="file" t-on-change="(ev) => this.onLocationChange(line_index, ev)" accept="image/*" class="form-control"/>
                            <div t-if="line.location_attachments.length" class="mt-2 d-flex flex-wrap">
                                <t t-foreach="line.location_attachments" t-as="file" t-key="file_index">
                                    <div class="m-1">
                                        <img t-att-src="file.thumbnail || ''" style="max-width: 100px;"/>
                                        <span t-esc="file.name"/>
                                        <button type="button" t-on-click="() => this.state.socket_lines[line_index].location_attachments.splice(file_index, 1)" class="btn btn-sm btn-danger ml-2">Remove</button>
                                    </div>
                                </t>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Photo/Video of Route &amp; Supply</label>
                            <input type="file" multiple="multiple" t-on-change="(ev) => this.onRouteChange(line_index, ev)" accept="image/*,video/*" class="form-control"/>
                            <div t-if="line.route_attachments.length" class="mt-2 d-flex flex-wrap">
                                <t t-foreach="line.route_attachments" t-as="file" t-key="file_index">
                                    <div class="m-1">
                                        <t t-if="file.thumbnail">
                                            <img t-att-src="file.thumbnail || ''" style="max-width: 100px;"/>
                                        </t>
                                        <span t-esc="file.name"/>
                                        <button type="button" t-on-click="() => this.state.socket_lines[line_index].route_attachments.splice(file_index, 1)" class="btn btn-sm btn-danger ml-2">Remove</button>
                                    </div>
                                </t>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Additional Comments</label>
                            <textarea t-model="line.socket_comments" class="form-control" rows="3"/>
                        </div>
                        <button type="button" t-on-click="() => this.removeSocketLine(line_index)" class="btn btn-danger" t-if="state.socket_lines.length > 1">Remove Socket</button>
                    </div>
                    <button type="button" t-on-click="addSocketLine" class="btn btn-secondary mt-3">Add Another Socket</button>
                </div>
                <div t-if="state.job_type === 'downlights' &amp;&amp; state.current_step === 4">
                    <h3>Step 4: Downlights Placement</h3>
                    <p>Placeholder: Ceiling type?</p>
                    <input type="text" t-model="state.ceiling_type" class="form-control" />
                </div>
                <!-- Final step for other job types -->
                <div t-if="state.current_step === state.total_steps &amp;&amp; state.job_type &amp;&amp; state.job_type !== 'new_socket'">
                    <h3>Step <t t-esc="state.total_steps"/>: Additional Notes &amp; Attachments</h3>
                    <div class="form-group">
                        <label for="customer_notes">Additional Notes</label>
                        <textarea id="customer_notes" t-model="state.customer_notes" class="form-control" rows="4" placeholder="Any other details or special requirements..."/>
                    </div>
                    <div class="form-group">
                        <label for="attachments">Other Relevant Data (Photos, PDFs, Excel, Videos)</label>
                        <input type="file" id="attachments" multiple="multiple" accept="image/*,application/pdf,.xlsx,.xls,video/*" t-on-change="onFileChange" class="form-control"/>
                        <small class="form-text text-muted">Upload any additional files relevant to your request.</small>
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
                </div>
            </form>
        </div>
    `;

    return { template };
});