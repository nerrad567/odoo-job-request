odoo.define('electrical_job.job_request_form', ['@odoo/owl', '@web/core/network/rpc'], function (require) {
    'use strict';

    const { Component, useState, onMounted, xml } = require('@odoo/owl');
    const { rpc } = require('@web/core/network/rpc');

    class JobRequestForm extends Component {
        static template = xml`
            <div class="job-request-form">
                <h1>Electrical Job Request</h1>
                <form t-on-submit.prevent="submitForm">
                    <div t-if="state.current_step === 1">
                        <h3>Step 1: Basic Information</h3>
                        <div class="form-group">
                            <label for="name">Your Name <span style="color: red;">(REQUIRED)</span></label>
                            <input type="text" id="name" t-model="state.name" class="form-control" required="required"/>
                        </div>
                        <div class="form-group">
                            <label for="email">Email <span style="color: red;">(REQUIRED)</span></label>
                            <input type="email" id="email" t-model="state.email" class="form-control" required="required"/>
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone</label>
                            <input type="text" id="phone" t-model="state.phone" class="form-control"/>
                        </div>
                        <div class="form-group">
                            <label for="job_type">Job Type <span style="color: red;">(REQUIRED)</span></label>
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
                            <label>Property Type <span style="color: red;">(REQUIRED)</span></label>
                            <select t-model="state.property_type" class="form-control" required="required">
                                <option value="">Select...</option>
                                <option value="house">House</option>
                                <option value="flat">Flat/Apartment</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Approximate Property Age <span style="color: red;">(REQUIRED)</span></label>
                            <select t-model="state.property_age" class="form-control" required="required">
                                <option value="">Select...</option>
                                <option value="pre1950">Before 1950</option>
                                <option value="1950-1980">1950-1980</option>
                                <option value="post1980">After 1980</option>
                                <option value="unknown">Not Sure</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Foundation Type (affects wiring routes)</label>
                            <select t-model="state.foundation_type" class="form-control">
                                <option value="">Select...</option>
                                <option value="slab">Slab (no crawlspace)</option>
                                <option value="crawl">Crawlspace</option>
                                <option value="other">Other/Not Sure</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Attic Access Available? (for overhead routing)</label>
                            <select t-model="state.attic_access" class="form-control">
                                <option value="">Select...</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                                <option value="unknown">Not Sure</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Photo of Fuse Board / Electrical Panel <span style="color: red;">(REQUIRED)</span></label>
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
                                <label>Room Name <span style="color: red;">(REQUIRED)</span></label>
                                <input type="text" t-model="line.room_name" class="form-control" required="required"/>
                            </div>
                            <div class="form-group">
                                <label>Socket Style <span style="color: red;">(REQUIRED)</span></label>
                                <select t-model="line.socket_style" class="form-control" required="required">
                                    <option value="">Select a style</option>
                                    <t t-foreach="socketStyles" t-as="style" t-key="style_index">
                                        <option t-att-value="style.value" t-esc="style.label"/>
                                    </t>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Height from Floor (in meters, e.g., 1.2) <span style="color: red;">(REQUIRED)</span></label>
                                <input type="number" t-model="line.height_from_floor" class="form-control" min="0" step="any" required="required"/>
                            </div>
                            <div class="form-group">
                                <label>Surface or Flush Mounted? <span style="color: red;">(REQUIRED)</span></label>
                                <select t-model="line.mount_type" class="form-control" required="required">
                                    <option value="">Select...</option>
                                    <option value="surface">Surface (on wall)</option>
                                    <option value="flush">Flush (in wall)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Flooring Type <span style="color: red;">(REQUIRED)</span></label>
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
                            <span class="ml-2">Processing...</span>
                        </t>
                        <t t-if="state.job_type === 'new_socket'">
                            <span class="ml-2">[Total Sockets - <t t-esc="state.socket_lines.length"/>]</span>
                        </t>
                    </div>
                </form>
            </div>
        `;

        setup() {
            this.state = useState({
                current_step: 1,
                total_steps: 1, // Updated dynamically
                name: '',
                email: '',
                phone: '',
                job_type: '',
                customer_notes: '',
                socket_lines: [],
                attachments: [],
                isSubmitting: false,
                message: '',
                messageType: '',
                property_type: '',
                property_age: '',
                foundation_type: '',
                attic_access: '',
                panel_type: '',
                recent_upgrades: '',
                fuse_board_attachment: null,
                water_bond: '',
                water_bond_location: '',
                water_bond_attachment: null,
                gas_bond: '',
                gas_bond_location: '',
                gas_bond_attachment: null,
                oil_bond: '',
                oil_bond_location: '',
                oil_bond_attachment: null,
                other_services: '',
                other_services_desc: '',
                other_services_attachment: null,
            });

            onMounted(() => {
                console.log('JobRequestForm mounted');
            });
        }

        updateJobType(ev) {
            this.state.job_type = ev.target.value;
            this.updateTotalSteps();
        }

        updateTotalSteps() {
            if (this.state.job_type === 'new_socket') {
                this.state.total_steps = 5; // Basic, General, Bonding, Sockets, Notes/Attach
            } else if (this.state.job_type) {
                this.state.total_steps = 2; // Basic, Notes/Attach for other types
            } else {
                this.state.total_steps = 1; // Only Basic if no job_type
            }
        }

        validateCurrentStep() {
            if (this.state.current_step === 1) {
                if (!this.state.name.trim() || !this.state.email.includes('@') || !this.state.job_type) {
                    this.state.message = 'Please fill required fields in Basic Information with a valid email.';
                    this.state.messageType = 'alert-danger';
                    return false;
                }
            } else if (this.state.current_step === 2 && this.state.job_type === 'new_socket') {
                if (!this.state.property_type || !this.state.property_age || !this.state.fuse_board_attachment) {
                    this.state.message = 'Please fill required fields in General Property Details.';
                    this.state.messageType = 'alert-danger';
                    return false;
                }
            } else if (this.state.current_step === 4 && this.state.job_type === 'new_socket') {
                if (this.state.socket_lines.length === 0) {
                    this.state.message = 'Please add at least one socket.';
                    this.state.messageType = 'alert-danger';
                    return false;
                }
                for (let line of this.state.socket_lines) {
                    if (!line.room_name.trim() || !line.socket_style || line.height_from_floor <= 0 || !line.mount_type || !line.flooring_type) {
                        this.state.message = 'Please fill required fields for all sockets.';
                        this.state.messageType = 'alert-danger';
                        return false;
                    }
                }
            }
            // Add more step validations as needed
            return true;
        }

        nextStep() {
            if (this.validateCurrentStep()) {
                if (this.state.current_step < this.state.total_steps) {
                    if (this.state.current_step === 3 && this.state.job_type === 'new_socket' && this.state.socket_lines.length === 0) {
                        this.addSocketLine(); // Add initial socket when entering step 4
                    }
                    this.state.current_step++;
                    this.state.message = ''; // Clear error
                }
            }
        }

        prevStep() {
            if (this.state.current_step > 1) {
                this.state.current_step--;
                this.state.message = ''; // Clear error
            }
        }

        addSocketLine() {
            this.state.socket_lines.push({ room_name: '', socket_style: '', height_from_floor: 0, mount_type: '', flooring_type: '', flooring_other: '', wall_type: '', gangs: '', location_attachments: [], route_attachments: [], socket_comments: '' });
        }

        removeSocketLine(index) {
            if (this.state.socket_lines.length > 1) {
                this.state.socket_lines.splice(index, 1);
            }
        }

        async onFileChange(ev) {
            const files = Array.from(ev.target.files);
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'video/mp4', 'video/mpeg', 'video/webm'];
            const maxFileSize = 1 * 1024 * 1024 * 1024; // 1GB
            const maxTotalSize = 10 * 1024 * 1024 * 1024; // 10GB

            let totalSize = this.state.attachments.reduce((sum, f) => sum + f.size, 0);
            const validFiles = await Promise.all(files.map(async file => {
                if (!allowedTypes.includes(file.type)) return null;
                if (file.size > maxFileSize) return null;
                totalSize += file.size;
                if (totalSize > maxTotalSize) return null;
                let thumbnail = null;
                if (file.type.startsWith('image/')) {
                    thumbnail = await this.getThumbnail(file);
                }
                return { name: file.name, type: file.type, size: file.size, file, thumbnail, status: 'pending', progress: 0 };
            }));

            this.state.attachments.push(...validFiles.filter(f => f));
        }

        removeFile(index) {
            this.state.attachments.splice(index, 1);
        }

        getThumbnail(file) {
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        }

        async onFuseBoardChange(ev) {
            await this.handleSingleFileChange(ev, 'fuse_board_attachment');
        }

        async onWaterBondPhotoChange(ev) {
            await this.handleSingleFileChange(ev, 'water_bond_attachment');
        }

        async onGasBondPhotoChange(ev) {
            await this.handleSingleFileChange(ev, 'gas_bond_attachment');
        }

        async onOilBondPhotoChange(ev) {
            await this.handleSingleFileChange(ev, 'oil_bond_attachment');
        }

        async onOtherServicesPhotoChange(ev) {
            await this.handleSingleFileChange(ev, 'other_services_attachment');
        }

        async handleSingleFileChange(ev, key) {
            const file = ev.target.files[0];
            if (!file) return;
            // Similar validation as onFileChange
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                this.state.message = `Invalid file type for ${key}.`;
                this.state.messageType = 'alert-danger';
                return;
            }
            // Size checks...
            let thumbnail = await this.getThumbnail(file);
            this.state[key] = { name: file.name, type: file.type, size: file.size, file, thumbnail, status: 'pending', progress: 0 };
        }

        async onLocationChange(index, ev) {
            await this.handleMultiFileChange(ev, index, 'location_attachments', ['image/jpeg', 'image/png', 'image/gif']);
        }

        async onRouteChange(index, ev) {
            await this.handleMultiFileChange(ev, index, 'route_attachments', ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mpeg', 'video/webm']);
        }

        async handleMultiFileChange(ev, index, key, allowedTypes) {
            const files = Array.from(ev.target.files);
            // Validation similar to onFileChange
            const validFiles = await Promise.all(files.filter(file => allowedTypes.includes(file.type)).map(async file => {
                let thumbnail = null;
                if (file.type.startsWith('image/')) {
                    thumbnail = await this.getThumbnail(file);
                }
                return { name: file.name, type: file.type, size: file.size, file, thumbnail, status: 'pending', progress: 0 };
            }));
            this.state.socket_lines[index][key].push(...validFiles);
        }

        async uploadFile(fileObj) {
            // Existing upload logic to get presigned URL and PUT to S3
            const presigned = await rpc('/job-request/presigned-url', {
                file_name: fileObj.name,
                file_type: fileObj.type
            });
            if (presigned.status !== 'success') throw new Error(presigned.message);

            const response = await fetch(presigned.data.url, {
                method: 'PUT',
                body: fileObj.file,
                headers: { 'Content-Type': fileObj.type }
            });

            if (!response.ok) throw new Error('Upload failed');

            return { name: fileObj.name, type: fileObj.type, s3_key: presigned.data.s3_key };
        }

        async submitForm(ev) {
            ev.preventDefault();
            this.state.message = '';
            this.state.messageType = '';

            // Basic validation
            if (this.state.job_type === 'new_socket' && !this.state.socket_lines.length) {
                this.state.message = 'At least one socket required.';
                this.state.messageType = 'alert-danger';
                return;
            }
            if (this.state.job_type === 'new_socket' && !this.state.fuse_board_attachment) {
                this.state.message = 'Fuse board photo required.';
                this.state.messageType = 'alert-danger';
                return;
            }

            this.state.isSubmitting = true;

            try {
                // Upload header single attachments
                const headerMetadata = {};
                for (const key of ['fuse_board_attachment', 'water_bond_attachment', 'gas_bond_attachment', 'oil_bond_attachment', 'other_services_attachment']) {
                    const fileObj = this.state[key];
                    if (fileObj && fileObj.status === 'pending') {
                        headerMetadata[key] = await this.uploadFile(fileObj);
                        fileObj.status = 'uploaded';
                    } else if (fileObj) {
                        headerMetadata[key] = { name: fileObj.name, type: fileObj.type, s3_key: fileObj.s3_key };
                    }
                }

                // Upload per-socket
                const socketMetadata = await Promise.all(this.state.socket_lines.map(async line => ({
                    location_attachments: await Promise.all(line.location_attachments.map(async f => {
                        if (f.status === 'pending') f = await this.uploadFile(f);
                        return { name: f.name, type: f.type, s3_key: f.s3_key };
                    })),
                    route_attachments: await Promise.all(line.route_attachments.map(async f => {
                        if (f.status === 'pending') f = await this.uploadFile(f);
                        return { name: f.name, type: f.type, s3_key: f.s3_key };
                    })),
                })));

                // Upload general attachments
                const generalMetadata = await Promise.all(this.state.attachments.map(async f => {
                    if (f.status === 'pending') f = await this.uploadFile(f);
                    return { name: f.name, type: f.type, s3_key: f.s3_key };
                }));

                const formData = {
                    name: this.state.name,
                    email: this.state.email,
                    phone: this.state.phone,
                    job_type: this.state.job_type,
                    customer_notes: this.state.customer_notes,
                    property_type: this.state.property_type,
                    property_age: this.state.property_age,
                    foundation_type: this.state.foundation_type,
                    attic_access: this.state.attic_access,
                    panel_type: this.state.panel_type,
                    recent_upgrades: this.state.recent_upgrades,
                    fuse_board_attachment: headerMetadata.fuse_board_attachment,
                    water_bond: this.state.water_bond,
                    water_bond_location: this.state.water_bond_location,
                    water_bond_attachment: headerMetadata.water_bond_attachment,
                    gas_bond: this.state.gas_bond,
                    gas_bond_location: this.state.gas_bond_location,
                    gas_bond_attachment: headerMetadata.gas_bond_attachment,
                    oil_bond: this.state.oil_bond,
                    oil_bond_location: this.state.oil_bond_location,
                    oil_bond_attachment: headerMetadata.oil_bond_attachment,
                    other_services: this.state.other_services,
                    other_services_desc: this.state.other_services_desc,
                    other_services_attachment: headerMetadata.other_services_attachment,
                    socket_lines: this.state.socket_lines.map((line, i) => ({
                        room_name: line.room_name,
                        socket_style: line.socket_style,
                        height_from_floor: line.height_from_floor,
                        mount_type: line.mount_type,
                        flooring_type: line.flooring_type,
                        flooring_other: line.flooring_other,
                        wall_type: line.wall_type,
                        gangs: line.gangs,
                        location_attachments: socketMetadata[i].location_attachments,
                        route_attachments: socketMetadata[i].route_attachments,
                        socket_comments: line.socket_comments,
                    })),
                    attachments: generalMetadata,
                };

                const response = await rpc('/job-request/submit', formData);
                if (response.status === 'success') {
                    this.state.message = 'Submitted successfully.';
                    this.state.messageType = 'alert-success';
                    setTimeout(() => window.location.href = '/job-request/thank-you', 2000);
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                this.state.message = 'Error: ' + error.message;
                this.state.messageType = 'alert-danger';
            } finally {
                this.state.isSubmitting = false;
            }
        }

        get socketStyles() {
            return [
                { value: 'standard', label: 'Standard' },
                { value: 'usb', label: 'USB Integrated' },
                { value: 'smart', label: 'Smart Socket' }
            ];
        }
    }

    const root = document.querySelector('#job_request_form');
    if (root) {
        const { mount } = owl;
        mount(JobRequestForm, root);
    } else {
        console.log('No #job_request_form element found, skipping mount');
    }
});