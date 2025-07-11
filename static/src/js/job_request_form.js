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
                customer_notes: '',
                socket_lines: [],
                attachments: [],
                isSubmitting: false,
                message: '',
                messageType: '',
                property_type: '',
                property_age: '',
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
                num_sockets: 1, // Default for new_socket prepopulation
                uploadProgress: 0,
                errors: {
                    first_name: '',
                    email: '',
                    mobile: '',
                    postcode: '',
                    job_type: '',
                    fuse_board: '',
                    num_sockets: '',
                    // Add more for other required fields
                },
                activeCategory: null, // To remember open accordion category
                // Placeholder fields for other job types
                ev_power_level: '',
                ev_location: '',
                light_type: '',
                light_quantity: '',
                consumer_unit_type: '',
                safety_report_type: '',
                rewire_scope: '',
                rewire_rooms: '',
                cabling_length: '',
                network_speed: '',
                heating_system_type: '',
                smart_integration_type: '',
                socket_quantity: '',
                appliance_type: '',
                outbuilding_type: '',
                ev_power_rating: '',
                light_location: '',
                downlights_count: '',
                smart_compatibility: '',
                motion_sensor: '',
                dimmer_count: '',
                current_unit_type: '',
                rccb_circuit: '',
                surge_scope: '',
                property_size: '',
                alarms_count: '',
                bonding_status: '',
                last_test_date: '',
                emergency_type: '',
                rooms_count: '',
                partial_rooms: '',
                trunking_length: '',
                facility_size: '',
                minor_description: '',
                fault_symptoms: '',
                cable_type: '',
                ethernet_points: '',
                coverage_area: '',
                shower_power: '',
                heating_area: '',
                thermostat_type: '',
                integration_platform: '',
                hub_brand: '',
                knx_devices: '',
                panel_location: '',
                doors_count: '',
                cameras_count: '',
                gate_type: '',
                lighting_bonding: '',
                smart_systems: '',
                ceiling_type: '',
            });
            this.formRef = useRef('form');

            onMounted(() => {
                console.log('JobRequestForm mounted');
            });
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
            this.state.socket_lines = [];
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
                if (!this.state.fuse_board_attachment) {
                    this.state.errors.fuse_board = 'Fuse board photo is required.';
                    return false;
                } else {
                    this.state.errors.fuse_board = '';
                }
                if (!this.state.property_type) {
                    this.state.errors.property_type = 'Property type is required.';
                    return false;
                } else {
                    this.state.errors.property_type = '';
                }
                if (!this.state.property_age) {
                    this.state.errors.property_age = 'Property age is required.';
                    return false;
                } else {
                    this.state.errors.property_age = '';
                }
            }
            if (this.state.current_step === 4 && this.state.job_type === 'new_socket') {
                if (!this.state.num_sockets || this.state.num_sockets < 1) {
                    this.state.errors.num_sockets = 'At least one socket is required.';
                    return false;
                } else {
                    this.state.errors.num_sockets = '';
                }
                for (let i = 0; i < this.state.socket_lines.length; i++) {
                    const line = this.state.socket_lines[i];
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
                    if (!line.height_from_floor || line.height_from_floor <= 0) {
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
            } else if (field === 'property_type') {
                if (!value) error = 'Property type is required.';
            } else if (field === 'property_age') {
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
                    if (this.state.current_step === 3 && this.state.job_type === 'new_socket' && this.state.socket_lines.length === 0) {
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
            this.state.socket_lines.push({
                room_name: '',
                socket_style: '',
                height_from_floor: 0,
                mount_type: '',
                flooring_type: '',
                flooring_other: '',
                wall_type: '',
                gangs: '',
                location_attachments: [],
                route_attachments: [],
                socket_comments: ''
            });
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
                    thumbnail = await fileUtils.getThumbnail(file);
                }
                return { name: file.name, type: file.type, size: file.size, file, thumbnail, status: 'pending', progress: 0 };
            }));

            this.state.attachments.push(...validFiles.filter(f => f));
        }

        removeFile(index) {
            this.state.attachments.splice(index, 1);
        }

        async onFuseBoardChange(ev) {
            await fileUtils.handleSingleFileChange(ev, 'fuse_board_attachment', this.state);
            this.state.errors.fuse_board = ''; // Clear error on upload
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

        async uploadFile(fileObj) {
            return await fileUtils.uploadFile(fileObj, this.updateUploadProgress.bind(this));
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

            // Per-job validation
            if (this.state.job_type === 'new_socket') {
                if (!this.state.socket_lines.length) {
                    this.state.message = 'At least one socket required.';
                    this.state.messageType = 'alert-danger';
                    return;
                }
                if (!this.state.fuse_board_attachment) {
                    this.state.message = 'Fuse board photo required.';
                    this.state.messageType = 'alert-danger';
                    return;
                }
                if (!this.state.property_type) {
                    this.state.message = 'Property type is required.';
                    this.state.messageType = 'alert-danger';
                    return;
                }
                if (!this.state.property_age) {
                    this.state.message = 'Property age is required.';
                    this.state.messageType = 'alert-danger';
                    return;
                }
            }

            let allPendingFiles = [];
            let totalUploadSize = 0;

            // Collect header attachments
            for (const key of ['fuse_board_attachment', 'water_bond_attachment', 'gas_bond_attachment', 'oil_bond_attachment', 'other_services_attachment']) {
                const fileObj = this.state[key];
                if (fileObj && fileObj.status === 'pending') {
                    allPendingFiles.push(fileObj);
                    totalUploadSize += fileObj.size || 0;
                }
            }

            // Collect socket attachments
            this.state.socket_lines.forEach(line => {
                line.location_attachments.forEach(f => {
                    if (f.status === 'pending') {
                        allPendingFiles.push(f);
                        totalUploadSize += f.size || 0;
                    }
                });
                line.route_attachments.forEach(f => {
                    if (f.status === 'pending') {
                        allPendingFiles.push(f);
                        totalUploadSize += f.size || 0;
                    }
                });
            });

            // Collect general attachments
            this.state.attachments.forEach(f => {
                if (f.status === 'pending') {
                    allPendingFiles.push(f);
                    totalUploadSize += f.size || 0;
                }
            });

            this.allPendingFiles = allPendingFiles;
            this.totalUploadSize = totalUploadSize;
            if (this.totalUploadSize === 0) {
                this.state.uploadProgress = 100;
            }

            this.state.isSubmitting = true;

            try {
                // Upload header single attachments
                const headerMetadata = {};
                for (const key of ['fuse_board_attachment', 'water_bond_attachment', 'gas_bond_attachment', 'oil_bond_attachment', 'other_services_attachment']) {
                    const fileObj = this.state[key];
                    if (fileObj && fileObj.status === 'pending') {
                        headerMetadata[key] = await this.uploadFile(fileObj);
                    } else if (fileObj) {
                        headerMetadata[key] = { name: fileObj.name, type: fileObj.type, s3_key: fileObj.s3_key };
                    }
                }

                // Upload per-socket
                const socketMetadata = await Promise.all(this.state.socket_lines.map(async line => ({
                    location_attachments: await Promise.all(line.location_attachments.map(async f => {
                        if (f.status === 'pending') {
                            return await this.uploadFile(f);
                        }
                        return { name: f.name, type: f.type, s3_key: f.s3_key };
                    })),
                    route_attachments: await Promise.all(line.route_attachments.map(async f => {
                        if (f.status === 'pending') {
                            return await this.uploadFile(f);
                        }
                        return { name: f.name, type: f.type, s3_key: f.s3_key };
                    })),
                })));

                // Upload general attachments
                const generalMetadata = await Promise.all(this.state.attachments.map(async f => {
                    if (f.status === 'pending') {
                        return await this.uploadFile(f);
                    }
                    return { name: f.name, type: f.type, s3_key: f.s3_key };
                }));

                const formData = {
                    first_name: this.state.first_name,
                    email: this.state.email,
                    mobile: this.state.mobile,
                    postcode: this.state.postcode,
                    job_type: this.state.job_type,
                    customer_notes: this.state.customer_notes,
                    property_type: this.state.property_type,
                    property_age: this.state.property_age,
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
                    // Placeholder fields
                    ev_power_level: this.state.ev_power_level,
                    ev_location: this.state.ev_location,
                    light_type: this.state.light_type,
                    light_quantity: this.state.light_quantity,
                    consumer_unit_type: this.state.consumer_unit_type,
                    safety_report_type: this.state.safety_report_type,
                    rewire_scope: this.state.rewire_scope,
                    rewire_rooms: this.state.rewire_rooms,
                    cabling_length: this.state.cabling_length,
                    network_speed: this.state.network_speed,
                    heating_system_type: this.state.heating_system_type,
                    smart_integration_type: this.state.smart_integration_type,
                    socket_quantity: this.state.socket_quantity,
                    appliance_type: this.state.appliance_type,
                    outbuilding_type: this.state.outbuilding_type,
                    ev_power_rating: this.state.ev_power_rating,
                    light_location: this.state.light_location,
                    downlights_count: this.state.downlights_count,
                    smart_compatibility: this.state.smart_compatibility,
                    motion_sensor: this.state.motion_sensor,
                    dimmer_count: this.state.dimmer_count,
                    current_unit_type: this.state.current_unit_type,
                    rccb_circuit: this.state.rccb_circuit,
                    surge_scope: this.state.surge_scope,
                    property_size: this.state.property_size,
                    alarms_count: this.state.alarms_count,
                    bonding_status: this.state.bonding_status,
                    last_test_date: this.state.last_test_date,
                    emergency_type: this.state.emergency_type,
                    rooms_count: this.state.rooms_count,
                    partial_rooms: this.state.partial_rooms,
                    trunking_length: this.state.trunking_length,
                    facility_size: this.state.facility_size,
                    minor_description: this.state.minor_description,
                    fault_symptoms: this.state.fault_symptoms,
                    cable_type: this.state.cable_type,
                    ethernet_points: this.state.ethernet_points,
                    coverage_area: this.state.coverage_area,
                    shower_power: this.state.shower_power,
                    heating_area: this.state.heating_area,
                    thermostat_type: this.state.thermostat_type,
                    integration_platform: this.state.integration_platform,
                    hub_brand: this.state.hub_brand,
                    knx_devices: this.state.knx_devices,
                    panel_location: this.state.panel_location,
                    doors_count: this.state.doors_count,
                    cameras_count: this.state.cameras_count,
                    gate_type: this.state.gate_type,
                    lighting_bonding: this.state.lighting_bonding,
                    smart_systems: this.state.smart_systems,
                    ceiling_type: this.state.ceiling_type,
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
    }

    const root = document.querySelector('#job_request_form');
    if (root) {
        const { mount } = owl;
        mount(JobRequestForm, root);
    } else {
        console.log('No #job_request_form element found, skipping mount');
    }
});