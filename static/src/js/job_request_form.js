odoo.define('electrical_job_request.job_request_form', ['@odoo/owl', '@web/core/network/rpc', 'electrical_job_request.validation_utils', 'electrical_job_request.file_utils', 'electrical_job_request.form_steps'], function (require) {
    'use strict';

    const { Component, useState, onMounted, useRef } = require('@odoo/owl');
    const { rpc } = require('@web/core/network/rpc');
    const validationUtils = require('electrical_job_request.validation_utils');
    const fileUtils = require('electrical_job_request.file_utils');
    const formSteps = require('electrical_job_request.form_steps');

    class JobRequestForm extends Component {
        static template = formSteps.template;

        setup() {
            this.state = useState({
                current_step: 1,
                total_steps: 1,
                first_name: '',
                email: '',
                mobile: '',
                postcode: '',
                job_type: '',
                additional_notes: '',
                new_socket_installations: [],  //# Updated: Matches controller 'new_socket_installations' for job_specific_details
                general_site_video_attachments: [], // # Updated: Matches misc.general_site_video_attachments
                unknown_attachment: null,  //# Updated: Matches misc.unknown_attachment (single)
                isSubmitting: false,
                message: '',
                messageType: '',
                building_type: '', // # Updated: Matches property_details.building_type
                construction_age: '',
                attic_access_availability: '',
                electrical_panel_type: '',
                recent_electrical_upgrades: '',
                fuse_board_photo_attachment: null,
                water_is_present: '',
                water_installation_location: '',
                water_photo_attachment: null,
                gas_is_present: '',
                gas_installation_location: '',
                gas_photo_attachment: null,
                oil_is_present: '',
                oil_installation_location: '',
                oil_photo_attachment: null,
                other_services_is_present: '',
                other_services_description: '',
                other_services_photo_attachment: null,
                num_sockets: 1, // Default for new_socket prepopulation
                uploadProgress: 0,
                errors: {
                    first_name: '',
                    email: '',
                    mobile: '',
                    postcode: '',
                    job_type: '',
                    fuse_board_photo_attachment: '',
                    num_sockets: '',
                    // Add more for other required fields
                },
                activeCategory: null, // To remember open accordion category
                // Fields for other job types (complete for all 35, matching controller data.get)
                power_rating: '', // # For ev_charger.job_specific_details.ev_charger_installation.power_rating
                installation_location: '',  //# For ev_charger
                ev_comments: '', // # For ev_charger
                ev_attachments: [], // # For ev_charger attachments (list)
                cctv_comments: '',//  # For cctv.job_specific_details.cctv_system_details.comments
                camera_installations: [], // # For cctv.camera_installations array of {installation_position, resolution, camera_comments, attachments: []}
                // ... (add fields for remaining 32 job_types, e.g., for 'additional_circuit': appliance_type: '', etc., based on controller conditionals)
            });
            this.formRef = useRef('form');

            onMounted(() => {
                console.log('JobRequestForm mounted');
                if (this.props.resume_code) {
                    this.loadResume(this.props.resume_code); // # Added: Auto-load from /resume if URL param (medium: UX for direct resume)
                }
            });
        }

        async loadResume(code) {
            try {
                const response = await rpc('/job-request/resume', { code });
                if (response.status === 'success') {
                    const loadedData = response.data;
                    this.state.job_type = loadedData.job_type;
                    Object.assign(this.state, loadedData.job_specific); // # Pre-fill state from loaded JSON (matches controller return {job_type, job_specific: json.loads()})
                    this.updateTotalSteps();
                    // For arrays like new_socket_installations, set directly: this.state.new_socket_installations = loadedData.job_specific.job_specific_details.new_socket_installations || [];
                    // Handle file metadata (already uploaded, with id/s3_key—display without re-upload)
                    this.state.message = 'Form resumed successfully.';
                    this.state.messageType = 'alert-success';
                } else {
                    this.state.message = response.message;
                    this.state.messageType = 'alert-danger';
                }
            } catch (error) {
                this.state.message = 'Error resuming form.';
                this.state.messageType = 'alert-danger';
            }
        }


        get categories() {
            return [
                {
                    value: 'power_sockets',
                    label: 'Power & Sockets',
                    icon: 'fa-bolt',
                    jobs: [
                        { value: 'new_socket', label: 'New Socket Installation', icon: 'fa-plug' },
                        { value: 'additional_circuit', label: 'Additional Circuit Installation', icon: 'fa-sitemap' },
                        { value: 'outbuilding_power', label: 'Outbuilding Power Supply', icon: 'fa-building-o' },
                        { value: 'ev_charger', label: 'EV Charger Installation', icon: 'fa-car' },
                    ]
                },
                {
                    value: 'lighting_controls',
                    label: 'Lighting & Controls',
                    icon: 'fa-lightbulb-o',
                    jobs: [
                        { value: 'new_light', label: 'New Light Installation', icon: 'fa-lightbulb-o' },
                        { value: 'downlights', label: 'Downlights / Spotlights', icon: 'fa-dot-circle-o' },
                        { value: 'smart_lighting', label: 'Smart Lighting Systems', icon: 'fa-toggle-on' },
                        { value: 'outdoor_lighting', label: 'Outdoor & Security Lighting', icon: 'fa-tree' },
                        { value: 'dimmer_install', label: 'Dimmer Switch Installation', icon: 'fa-sliders' },
                    ]
                },
                {
                    value: 'consumer_unit_safety',
                    label: 'Consumer Unit & Safety',
                    icon: 'fa-shield',
                    jobs: [
                        { value: 'consumer_unit', label: 'Consumer Unit / Fusebox Upgrade', icon: 'fa-power-off' },
                        { value: 'rccb_install', label: 'RCD / RCBO Installation', icon: 'fa-shield' },
                        { value: 'surge_protection', label: 'Surge Protection Devices', icon: 'fa-bolt' },
                        { value: 'eicr', label: 'EICR / Safety Report', icon: 'fa-file-text-o' },
                        { value: 'smoke_alarms', label: 'Smoke & Heat Alarm Installation', icon: 'fa-fire-extinguisher' },
                        { value: 'earthing_bonding', label: 'Main Earthing & Bonding', icon: 'fa-link' },
                        { value: 'fixed_wire_testing', label: 'Fixed Wire Testing', icon: 'fa-wrench' },
                        { value: 'emergency_lighting', label: 'Emergency Lighting', icon: 'fa-lightbulb-o' },
                    ]
                },
                {
                    value: 'rewires_small_works',
                    label: 'Rewires & Small Works',
                    icon: 'fa-wrench',
                    jobs: [
                        { value: 'full_rewire', label: 'Full Rewire', icon: 'fa-home' },
                        { value: 'partial_rewire', label: 'Partial Rewire', icon: 'fa-pencil' },
                        { value: 'dado_trunking', label: 'Dado Trunking', icon: 'fa-columns' },
                        { value: 'industrial_rewire', label: 'Industrial & Commercial Rewire', icon: 'fa-industry' },
                        { value: 'minor_works', label: 'Minor Electrical Works', icon: 'fa-tasks' },
                        { value: 'fault_finding', label: 'Fault Finding & Troubleshooting', icon: 'fa-search' },
                    ]
                },
                {
                    value: 'cabling_networking',
                    label: 'Cabling & Networking',
                    icon: 'fa-sitemap',
                    jobs: [
                        { value: 'structured_cabling', label: 'Structured & Data Cabling', icon: 'fa-sitemap' },
                        { value: 'ethernet_point', label: 'Ethernet Point Installation', icon: 'fa-plug' },
                        { value: 'wifi_booster', label: 'Wi-Fi Extender / Mesh Node', icon: 'fa-wifi' },
                    ]
                },
                {
                    value: 'heating_hot_water',
                    label: 'Heating & Hot Water',
                    icon: 'fa-thermometer',
                    jobs: [
                        { value: 'electric_shower', label: 'Electric Shower Installation', icon: 'fa-shower' },
                        { value: 'underfloor_heating', label: 'Underfloor Heating Wiring', icon: 'fa-thermometer' },
                        { value: 'heating_controls', label: 'Heating System Controls Installation', icon: 'fa-sliders' },
                        { value: 'smart_heating_controls', label: 'Smart Heating Controls Integration', icon: 'fa-mobile' },
                    ]
                },
                {
                    value: 'smart_home_building_controls',
                    label: 'Smart Home & Building Controls',
                    icon: 'fa-home',
                    jobs: [
                        { value: 'smart_hub', label: 'Smart Home Hub Integration', icon: 'fa-home' },
                        { value: 'knx_system', label: 'KNX Automation System', icon: 'fa-cogs' },
                        { value: 'home_automation_panel', label: 'Automation Control Panel', icon: 'fa-tachometer' },
                        { value: 'access_control', label: 'Access Control & Door Entry', icon: 'fa-key' },
                        { value: 'cctv', label: 'CCTV & Security Systems', icon: 'fa-video-camera' },
                        { value: 'automated_gates', label: 'Automated Gates & Barriers', icon: 'fa-road' },
                    ]
                },
            ];
        }

getCategoryOfJob(jobType) {
            for (let cat of this.categories) {
                if (cat.jobs.some(j => j.value === jobType)) {
                    return cat.value;
                }
            }
            return null;
        }

        toggleCategory(value) {
            this.state.activeCategory = this.state.activeCategory === value ? null : value;
        }

        selectJobType(value) {
            this.state.job_type = value;
            this.state.errors.job_type = '';
            this.state.activeCategory = this.getCategoryOfJob(value);
            this.updateTotalSteps();
            if (value === 'new_socket') {
                this.prepopulateSockets();
            }
        }

        getTotalStepsForJob(jobType) {
            const stepCounts = {
                // Power & Sockets
                'new_socket': 5, // Basic, Bonding, Fuse Board, Socket Details, Notes
                'additional_circuit': 5,
                'outbuilding_power': 5,
                'ev_charger': 4, // Basic, Bonding, Fuse Board, Notes
                // Lighting & Controls
                'new_light': 4,
                'downlights': 4,
                'smart_lighting': 4,
                'outdoor_lighting': 4,
                'dimmer_install': 4,
                // Consumer Unit & Safety
                'consumer_unit': 3,
                'rccb_install': 3,
                'surge_protection': 3,
                'eicr': 3,
                'smoke_alarms': 3,
                'earthing_bonding': 3,
                'fixed_wire_testing': 3,
                'emergency_lighting': 3,
                // Rewires & Small Works
                'full_rewire': 5,
                'partial_rewire': 5,
                'dado_trunking': 5,
                'industrial_rewire': 5,
                'minor_works': 5,
                'fault_finding': 5,
                // Cabling & Networking
                'structured_cabling': 4,
                'ethernet_point': 4,
                'wifi_booster': 4,
                // Heating & Hot Water
                'electric_shower': 4,
                'underfloor_heating': 4,
                'heating_controls': 4,
                'smart_heating_controls': 4,
                // Smart Home & Building Controls
                'smart_hub': 3,
                'knx_system': 3,
                'home_automation_panel': 3,
                'access_control': 3,
                'cctv': 3,
                'automated_gates': 3,
            };
            return stepCounts[jobType] || 2; // Default to Basic + Notes
        }

        updateTotalSteps() {
            if (this.state.job_type) {
                this.state.total_steps = this.getTotalStepsForJob(this.state.job_type);
            } else {
                this.state.total_steps = 1;
            }
        }

        prepopulateSockets() {
            this.state.new_socket_installations = [];
            const num = parseInt(this.state.num_sockets) || 1;
            for (let i = 0; i < num; i++) {
                this.addSocketLine();
            }
        }

        clearInvalidClasses() {
            validationUtils.clearInvalidClasses(this.formRef.el);
        }

        validateCurrentStep() {
            if (this.state.current_step === 3 && this.state.job_type === 'new_socket') {
                if (!this.state.fuse_board_photo_attachment) {
                    this.state.errors.fuse_board_photo_attachment = 'Fuse board photo is required.';
                    return false;
                } else {
                    this.state.errors.fuse_board_photo_attachment = '';
                }
                if (!this.state.building_type) {
                    this.state.errors.building_type = 'Property type is required.';
                    return false;
                } else {
                    this.state.errors.building_type = '';
                }
                if (!this.state.construction_age) {
                    this.state.errors.construction_age = 'Property age is required.';
                    return false;
                } else {
                    this.state.errors.construction_age = '';
                }
            }
            if (this.state.current_step === 4 && this.state.job_type === 'new_socket') {
                if (!this.state.num_sockets || this.state.num_sockets < 1) {
                    this.state.errors.num_sockets = 'At least one socket is required.';
                    return false;
                } else {
                    this.state.errors.num_sockets = '';
                }
                for (let i = 0; i < this.state.new_socket_installations.length; i++) {
                    const line = this.state.new_socket_installations[i];
                    if (!line.room_name) {
                        this.state.message = `Room name is required for socket ${i + 1}.`;
                        this.state.messageType = 'alert-danger';
                        return false;
                    }
                    if (!line.socket_style) {
                        this.state.message = `Socket style is required for socket ${i + 1}.`;
                        this.state.messageType = 'alert-danger';
                        return false;
                    }
                    if (!line.installation_height_from_floor || line.installation_height_from_floor <= 0) {
                        this.state.message = `Valid height from floor is required for socket ${i + 1}.`;
                        this.state.messageType = 'alert-danger';
                        return false;
                    }
                    if (!line.mount_type) {
                        this.state.message = `Mount type is required for socket ${i + 1}.`;
                        this.state.messageType = 'alert-danger';
                        return false;
                    }
                    if (!line.flooring_type) {
                        this.state.message = `Flooring type is required for socket ${i + 1}.`;
                        this.state.messageType = 'alert-danger';
                        return false;
                    }
                }
            }
            return validationUtils.validateCurrentStep(this.state, this.formRef.el);
        }

        validateField(field) {
            const value = this.state[field];
            let error = '';

            if (field === 'first_name') {
                if (!value.trim()) error = 'First name is required.';
            } else if (field === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value.trim()) error = 'Email is required.';
                else if (!emailRegex.test(value)) error = 'Invalid email format.';
            } else if (field === 'mobile') {
                const mobileRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;
                if (value && !mobileRegex.test(value)) error = 'Invalid UK mobile number.';
            } else if (field === 'postcode') {
                if (!value.trim()) {
                    error = 'Postcode is required.';
                } else {
                    const ukPostcodeRegex = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) ?[0-9][A-Za-z]{2})$/i;
                    if (!ukPostcodeRegex.test(value)) {
                        error = 'Invalid postcode format.';
                    }
                }
            } else if (field === 'building_type') {
                if (!value) error = 'Property type is required.';
            } else if (field === 'construction_age') {
                if (!value) error = 'Property age is required.';
            } else if (field === 'num_sockets') {
                if (!value || value < 1) error = 'At least one socket is required.';
            }

            this.state.errors[field] = error;
        }

        validatePostcode() {
            let pc = this.state.postcode.trim().toUpperCase().replace(/\s+/g, '');
            if (pc.length >= 5 && pc.length <= 7) {
                pc = pc.slice(0, -3) + ' ' + pc.slice(-3);
            }
            this.state.postcode = pc;
            this.validateField('postcode');
        }

        nextStep() {
            this.clearInvalidClasses();
            this.state.message = ''; // Clear previous message

            // Validate all fields in step 1
            if (this.state.current_step === 1) {
                ['first_name', 'email', 'mobile', 'postcode'].forEach(field => this.validateField(field));
                if (!this.state.job_type) {
                    this.state.errors.job_type = 'Job type is required.';
                }
            }

            if (this.validateCurrentStep()) {
                if (this.state.current_step < this.state.total_steps) {
                    if (this.state.current_step === 3 && this.state.job_type === 'new_socket' && this.state.new_socket_installations.length === 0) {
                        this.addSocketLine(); // Ensure at least one socket
                    }
                    this.state.current_step++;
                }
            }
        }

        prevStep() {
            if (this.state.current_step > 1) {
                this.state.current_step--;
                this.state.message = ''; // Clear error
                this.clearInvalidClasses();
            }
        }

        addSocketLine() {
            this.state.new_socket_installations.push({
                room_name: '',
                socket_style: '',
                installation_height_from_floor: 0,
                mount_type: '',
                flooring_type: '',
                flooring_other_description: '',
                wall_type: '',
                number_of_gangs: '',
                estimated_usage: '',
                comments: '',
                location_photo_attachments: [],
                route_photo_or_video_attachments: []
            });
        }

        removeSocketLine(index) {
            if (this.state.new_socket_installations.length > 1) {
                this.state.new_socket_installations.splice(index, 1);
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
                    thumbnail = await fileUtils.getThumbnail(file);
                }
                return { name: file.name, type: file.type, size: file.size, file, thumbnail, status: 'pending', progress: 0 };
            }));

            this.state.attachments.push(...validFiles.filter(f => f));
        }

        async removeFile(index) {
            const file = this.state.attachments[index];
            if (file.id) {  //# Added: If resumed/loaded with id, call /delete-attachment to clean DB/S3 (medium: Matches controller, prevents orphan attachments)
                await rpc('/job-request/delete-attachment', { attachment_ids: file.id });
            }
            this.state.attachments.splice(index, 1);
        }

        async onFuseBoardChange(ev) {
            await fileUtils.handleSingleFileChange(ev, 'fuse_board_photo_attachment', this.state);
            this.state.errors.fuse_board_photo_attachment = ''; // Clear error on upload
        }

        async onWaterBondPhotoChange(ev) {
            await fileUtils.handleSingleFileChange(ev, 'water_bond_attachment', this.state);
        }
        
        async onGasBondPhotoChange(ev) {
            await fileUtils.handleSingleFileChange(ev, 'gas_bond_attachment', this.state);
        }

        async onOilBondPhotoChange(ev) {
            await fileUtils.handleSingleFileChange(ev, 'oil_bond_attachment', this.state);
        }

        async onOtherServicesPhotoChange(ev) {
            await fileUtils.handleSingleFileChange(ev, 'other_services_attachment', this.state);
        }

        async onLocationChange(index, ev) {
            await fileUtils.handleMultiFileChange(ev, index, 'location_attachments', ['image/jpeg', 'image/png', 'image/gif'], this.state);
        }


        async onRouteChange(index, ev) {
            await fileUtils.handleMultiFileChange(ev, index, 'route_attachments', ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mpeg', 'video/webm'], this.state);
        }

        async onGeneralVideoChange(ev) {
                    await fileUtils.handleMultiFileChange(ev, null, 'general_site_video_attachments', ['video/mp4', 'video/mpeg', 'video/webm'], this.state); // # Updated: For misc.general_site_video_attachments (list)
                }

        async onUnknownAttachmentChange(ev) {
            await fileUtils.handleSingleFileChange(ev, 'unknown_attachment', this.state);  //# Updated: For misc.unknown_attachment (single)
        }

        async uploadFile(fileObj, updateProgressCallback) {
            return await fileUtils.uploadFile(fileObj, updateProgressCallback);
        }

        updateUploadProgress() {
            if (this.totalUploadSize === 0) {
                this.state.uploadProgress = 100;
                return;
            }
            let uploadedBytes = 0;
            this.allPendingFiles.forEach(f => {
                uploadedBytes += (f.progress / 100) * (f.size || 0);
            });
            this.state.uploadProgress = Math.round((uploadedBytes / this.totalUploadSize) * 100);
        }

        async submitForm(ev) {
            ev.preventDefault();
            this.state.message = '';
            this.state.messageType = '';

            // Per-job validation (update for new keys)
            if (this.state.job_type === 'new_socket') {
                if (!this.state.new_socket_installations.length) {
                    this.state.message = 'At least one socket required.';
                    this.state.messageType = 'alert-danger';
                    return;
                }
                if (!this.state.fuse_board_photo_attachment) {
                    this.state.message = 'Fuse board photo required.';
                    this.state.messageType = 'alert-danger';
                    return;
                }
                if (!this.state.building_type) {
                    this.state.message = 'Property type is required.';
                    this.state.messageType = 'alert-danger';
                    return;
                }
                if (!this.state.construction_age) {
                    this.state.message = 'Property age is required.';
                    this.state.messageType = 'alert-danger';
                    return;
                }
            }

            let allPendingFiles = [];
            let totalUploadSize = 0;

            // Collect header attachments (update keys)
            for (const key of ['fuse_board_photo_attachment', 'water_photo_attachment', 'gas_photo_attachment', 'oil_photo_attachment', 'other_services_photo_attachment']) {
                const fileObj = this.state[key];
                if (fileObj && fileObj.status === 'pending') {
                    allPendingFiles.push(fileObj);
                    totalUploadSize += fileObj.size || 0;
                }
            }

            // Collect per-socket (update arrays)
            this.state.new_socket_installations.forEach(line => {
                line.location_photo_attachments.forEach(f => {
                    if (f.status === 'pending') {
                        allPendingFiles.push(f);
                        totalUploadSize += f.size || 0;
                    }
                });
                line.route_photo_or_video_attachments.forEach(f => {
                    if (f.status === 'pending') {
                        allPendingFiles.push(f);
                        totalUploadSize += f.size || 0;
                    }
                });
            });

            // Collect general (update to general_site_video_attachments, unknown_attachment)
            this.state.general_site_video_attachments.forEach(f => {
                if (f.status === 'pending') {
                    allPendingFiles.push(f);
                    totalUploadSize += f.size || 0;
                }
            });
            const unknown = this.state.unknown_attachment;
            if (unknown && unknown.status === 'pending') {
                allPendingFiles.push(unknown);
                totalUploadSize += unknown.size || 0;
            }

            this.allPendingFiles = allPendingFiles;
            this.totalUploadSize = totalUploadSize;
            if (this.totalUploadSize === 0) {
                this.state.uploadProgress = 100;
            }

            this.state.isSubmitting = true;

            try {
                // Upload header single attachments (update keys)
                const headerMetadata = {};
                for (const key of ['fuse_board_photo_attachment', 'water_photo_attachment', 'gas_photo_attachment', 'oil_photo_attachment', 'other_services_photo_attachment']) {
                    const fileObj = this.state[key];
                    if (fileObj && fileObj.status === 'pending') {
                        headerMetadata[key] = await this.uploadFile(fileObj);
                    } else if (fileObj) {
                        headerMetadata[key] = { name: fileObj.name, type: fileObj.type, s3_key: fileObj.s3_key };
                    }
                }

                // Upload per-socket (update arrays)
                const socketMetadata = await Promise.all(this.state.new_socket_installations.map(async line => ({
                    location_photo_attachments: await Promise.all(line.location_photo_attachments.map(async f => {
                        if (f.status === 'pending') {
                            return await this.uploadFile(f);
                        }
                        return { name: f.name, type: f.type, s3_key: f.s3_key };
                    })),
                    route_photo_or_video_attachments: await Promise.all(line.route_photo_or_video_attachments.map(async f => {
                        if (f.status === 'pending') {
                            return await this.uploadFile(f);
                        }
                        return { name: f.name, type: f.type, s3_key: f.s3_key };
                    })),
                })));

                // Upload general (update to list/single)
                const generalVideoMetadata = await Promise.all(this.state.general_site_video_attachments.map(async f => {
                    if (f.status === 'pending') {
                        return await this.uploadFile(f);
                    }
                    return { name: f.name, type: f.type, s3_key: f.s3_key };
                }));
                let unknownMetadata = null;
                if (this.state.unknown_attachment && this.state.unknown_attachment.status === 'pending') {
                    unknownMetadata = await this.uploadFile(this.state.unknown_attachment);
                } else if (this.state.unknown_attachment) {
                    unknownMetadata = { name: this.state.unknown_attachment.name, type: this.state.unknown_attachment.type, s3_key: this.state.unknown_attachment.s3_key };
                }
                
                const formData = {
                    first_name: this.state.first_name,
                    email: this.state.email,
                    mobile: this.state.mobile,
                    postcode: this.state.postcode,
                    job_type: this.state.job_type,
                    additional_notes: this.state.additional_notes,
                    building_type: this.state.building_type,
                    construction_age: this.state.construction_age,
                    attic_access_availability: this.state.attic_access_availability,
                    electrical_panel_type: this.state.electrical_panel_type,
                    recent_electrical_upgrades: this.state.recent_electrical_upgrades,
                    fuse_board_photo_attachment: headerMetadata.fuse_board_photo_attachment,
                    water_is_present: this.state.water_is_present,
                    water_installation_location: this.state.water_installation_location,
                    water_photo_attachment: headerMetadata.water_photo_attachment,
                    gas_is_present: this.state.gas_is_present,
                    gas_installation_location: this.state.gas_installation_location,
                    gas_photo_attachment: headerMetadata.gas_photo_attachment,
                    oil_is_present: this.state.oil_is_present,
                    oil_installation_location: this.state.oil_installation_location,
                    oil_photo_attachment: headerMetadata.oil_photo_attachment,
                    other_services_is_present: this.state.other_services_is_present,
                    other_services_description: this.state.other_services_description,
                    other_services_photo_attachment: headerMetadata.other_services_photo_attachment,
                    new_socket_installations: this.state.new_socket_installations.map((line, i) => ({
                        room_name: line.room_name,
                        socket_style: line.socket_style,
                        installation_height_from_floor: line.installation_height_from_floor,
                        mount_type: line.mount_type,
                        flooring_type: line.flooring_type,
                        flooring_other_description: line.flooring_other_description,
                        wall_type: line.wall_type,
                        number_of_gangs: line.number_of_gangs,
                        estimated_usage: line.estimated_usage,
                        comments: line.comments,
                        location_photo_attachments: socketMetadata[i].location_photo_attachments,
                        route_photo_or_video_attachments: socketMetadata[i].route_photo_or_video_attachments,
                    })),
                    general_site_video_attachments: generalVideoMetadata,
                    unknown_attachment: unknownMetadata,
                    // Placeholder fields (complete for all 35, e.g., for 'ev_charger')
                    power_rating: this.state.power_rating,
                    installation_location: this.state.installation_location,
                    ev_comments: this.state.ev_comments,
                    ev_attachments: await Promise.all(this.state.ev_attachments.map(async f => {
                        if (f.status === 'pending') {
                            return await this.uploadFile(f);
                        }
                        return { name: f.name, type: f.type, s3_key: f.s3_key };
                    })),
                    // ... (add for remaining job types, matching controller conditionals)
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
                this.state.uploadProgress = 0;
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

        // Remove functions updated to call delete if id (e.g., for resumed files)
        async removeFuseBoardPhoto() {
            if (this.state.fuse_board_photo_attachment.id) {
                await rpc('/job-request/delete-attachment', { attachment_ids: this.state.fuse_board_photo_attachment.id });
            }
            this.state.fuse_board_photo_attachment = null;
        }

        // ... (similar for other remove: removeWaterPhoto, removeGasPhoto, etc., and for arrays: removeLocationAttachment(index, file_index) with if (file.id) rpc delete)

        async removeGeneralVideo(index) {
            const file = this.state.general_site_video_attachments[index];
            if (file.id) {
                await rpc('/job-request/delete-attachment', { attachment_ids: file.id });
            }
            this.state.general_site_video_attachments.splice(index, 1);
        }

        async removeUnknownAttachment() {
            if (this.state.unknown_attachment.id) {
                await rpc('/job-request/delete-attachment', { attachment_ids: this.state.unknown_attachment.id });
            }
            this.state.unknown_attachment = null;
        }

        // ... (add similar for ev_attachments remove, etc.)
    }

    const root = document.querySelector('#job_request_form');
    if (root) {
        const { mount } = owl;
        mount(JobRequestForm, root);
    } else {
        console.log('No #job_request_form element found, skipping mount');
    }
});