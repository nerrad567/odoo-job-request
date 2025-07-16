/** @odoo-module **/

import { Component, useState, onMounted, useRef, mount } from "@odoo/owl";
import { rpc } from "@web/core/network/rpc";
import * as validationUtils from "./validation_utils";
import * as fileUtils from "./file_utils";
import { template } from "./form_steps";

const CATEGORIES = [
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

const SOCKET_STYLES = [
    { value: 'standard', label: 'Standard' },
    { value: 'usb', label: 'USB Integrated' },
    { value: 'smart', label: 'Smart Socket' }
];

const STEP_COUNTS = {
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

class JobRequestForm extends Component {
    static template = template;

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
            new_socket_installations: [],
            general_site_video_attachments: [],
            unknown_attachment: null,
            isSubmitting: false,
            message: '',
            messageType: '',
            building_type: '',
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
            num_sockets: 1,
            uploadProgress: 0,
            errors: {
                first_name: '',
                email: '',
                mobile: '',
                postcode: '',
                job_type: '',
                fuse_board_photo_attachment: '',
                num_sockets: '',
            },
            activeCategory: null,
            power_rating: '',
            installation_location: '',
            ev_comments: '',
            ev_attachments: [],
            cctv_comments: '',
            camera_installations: [],
        });
        this.formRef = useRef('form');
        this.headerKeys = ['fuse_board_photo_attachment', 'water_photo_attachment', 'gas_photo_attachment', 'oil_photo_attachment', 'other_services_photo_attachment'];

        onMounted(() => {
            console.log('JobRequestForm mounted');
            if (this.props.resume_code) {
                this.loadResume(this.props.resume_code);
            }
        });
    }

    async loadResume(code) {
        try {
            const response = await rpc('/job-request/resume', { code });
            if (response.status === 'success') {
                const loadedData = response.data;
                this.state.job_type = loadedData.job_type;
                Object.assign(this.state, loadedData.job_specific);
                this.updateTotalSteps();
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

    get categories() { return CATEGORIES; }

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
        return STEP_COUNTS[jobType] || 2;
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
        // if (this.state.current_step === 3 && this.state.job_type === 'new_socket') {
        //     if (!this.state.fuse_board_photo_attachment) {
        //         this.state.errors.fuse_board_photo_attachment = 'Fuse board photo is required.';
        //         return false;
        //     } else {
        //         this.state.errors.fuse_board_photo_attachment = '';
        //     }
        //     if (!this.state.building_type) {
        //         this.state.errors.building_type = 'Property type is required.';
        //         return false;
        //     } else {
        //         this.state.errors.building_type = '';
        //     }
        //     if (!this.state.construction_age) {
        //         this.state.errors.construction_age = 'Property age is required.';
        //         return false;
        //     } else {
        //         this.state.errors.construction_age = '';
        //     }
        // }
        // if (this.state.current_step === 4 && this.state.job_type === 'new_socket') {
        //     if (!this.state.num_sockets || this.state.num_sockets < 1) {
        //         this.state.errors.num_sockets = 'At least one socket is required.';
        //         return false;
        //     } else {
        //         this.state.errors.num_sockets = '';
        //     }
        //     for (let i = 0; i < this.state.new_socket_installations.length; i++) {
        //         const line = this.state.new_socket_installations[i];
        //         if (!line.room_name) {
        //             this.state.message = `Room name is required for socket ${i + 1}.`;
        //             this.state.messageType = 'alert-danger';
        //             return false;
        //         }
        //         if (!line.socket_style) {
        //             this.state.message = `Socket style is required for socket ${i + 1}.`;
        //             this.state.messageType = 'alert-danger';
        //             return false;
        //         }
        //         if (!line.installation_height_from_floor || line.installation_height_from_floor <= 0) {
        //             this.state.message = `Valid height from floor is required for socket ${i + 1}.`;
        //             this.state.messageType = 'alert-danger';
        //             return false;
        //         }
        //         if (!line.mount_type) {
        //             this.state.message = `Mount type is required for socket ${i + 1}.`;
        //             this.state.messageType = 'alert-danger';
        //             return false;
        //         }
        //         if (!line.flooring_type) {
        //             this.state.message = `Flooring type is required for socket ${i + 1}.`;
        //             this.state.messageType = 'alert-danger';
        //             return false;
        //         }
        //     }
        // }
        return validationUtils.validateCurrentStep(this.state, this.formRef.el);
    }

    validateField(field) {
        const value = this.state[field];
        let error = '';

        // if (field === 'first_name') {
        //     if (!value.trim()) error = 'First name is required.';
        // } else if (field === 'email') {
        //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        //     if (!value.trim()) error = 'Email is required.';
        //     else if (!emailRegex.test(value)) error = 'Invalid email format.';
        // } else if (field === 'mobile') {
        //     const mobileRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;
        //     if (value && !mobileRegex.test(value)) error = 'Invalid UK mobile number.';
        // } else if (field === 'postcode') {
        //     if (!value.trim()) {
        //         error = 'Postcode is required.';
        //     } else {
        //         const ukPostcodeRegex = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) ?[0-9][A-Za-z]{2})$/i;
        //         if (!ukPostcodeRegex.test(value)) {
        //             error = 'Invalid postcode format.';
        //         }
        //     }
        // } else if (field === 'building_type') {
        //     if (!value) error = 'Property type is required.';
        // } else if (field === 'construction_age') {
        //     if (!value) error = 'Property age is required.';
        // } else if (field === 'num_sockets') {
        //     if (!value || value < 1) error = 'At least one socket is required.';
        // }

        this.state.errors[field] = error;
    }

    validatePostcode() {
        let pc = this.state.postcode.trim().toUpperCase().replace(/\s+/g, '');
        // if (pc.length >= 5 && pc.length <= 7) {
        //     pc = pc.slice(0, -3) + ' ' + pc.slice(-3);
        // }
        // this.state.postcode = pc;
        // this.validateField('postcode');
    }

    nextStep() {
        this.clearInvalidClasses();
        this.state.message = '';

        // if (this.state.current_step === 1) {
        //     ['first_name', 'email', 'mobile', 'postcode'].forEach(field => this.validateField(field));
        //     if (!this.state.job_type) {
        //         this.state.errors.job_type = 'Job type is required.';
        //     }
        // }

        if (this.validateCurrentStep()) {
            if (this.state.current_step < this.state.total_steps) {
                if (this.state.current_step === 3 && this.state.job_type === 'new_socket' && this.state.new_socket_installations.length === 0) {
                    this.addSocketLine();
                }
                this.state.current_step++;
            }
        }
    }

    prevStep() {
        if (this.state.current_step > 1) {
            this.state.current_step--;
            this.state.message = '';
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

    async handleSingleFileChange(key, ev) {
        await fileUtils.handleSingleFileChange(ev, key, this.state);
        if (key === 'fuse_board_photo_attachment') {
            this.state.errors.fuse_board_photo_attachment = '';
        }
    }

    async handleMultiFileChange(key, ev, allowedTypes, lineIndex = null) {
        await fileUtils.handleMultiFileChange(ev, lineIndex, key, allowedTypes, this.state);
    }

    async handleRemoveSingle(key) {
        const file = this.state[key];
        if (file && file.id) {
            await rpc('/job-request/delete-attachment', { attachment_ids: file.id });
        }
        this.state[key] = null;
    }

    async handleRemoveFromArray(key, fileIndex, lineIndex = null) {
        const target = lineIndex !== null ? this.state.new_socket_installations[lineIndex][key] : this.state[key];
        const file = target[fileIndex];
        if (file.id) {
            await rpc('/job-request/delete-attachment', { attachment_ids: file.id });
        }
        target.splice(fileIndex, 1);
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

    collectPendingFiles() {
        const fileSources = [
            ...this.headerKeys.map(key => ({ key, files: this.state[key] ? [this.state[key]] : [], isArray: false })),
            { key: 'general_site_video_attachments', files: this.state.general_site_video_attachments, isArray: true },
            { key: 'unknown_attachment', files: this.state.unknown_attachment ? [this.state.unknown_attachment] : [], isArray: false },
            ...this.state.new_socket_installations.flatMap(line => [
                { key: 'location_photo_attachments', files: line.location_photo_attachments, isArray: true },
                { key: 'route_photo_or_video_attachments', files: line.route_photo_or_video_attachments, isArray: true },
            ]),
            // Add for other job types, e.g., { key: 'ev_attachments', files: this.state.ev_attachments, isArray: true }
        ];
        const allPendingFiles = fileSources.flatMap(source => source.files.filter(f => f.status === 'pending'));
        const totalUploadSize = allPendingFiles.reduce((sum, f) => sum + (f.size || 0), 0);
        return { allPendingFiles, totalUploadSize };
    }

    async getMetadata(files, isArray) {
        if (isArray) {
            return Promise.all(files.map(async f => f.status === 'pending' ? await this.uploadFile(f, () => this.updateUploadProgress()) : { name: f.name, type: f.type, s3_key: f.s3_key }));
        } else if (files.length) {
            const f = files[0];
            return f.status === 'pending' ? await this.uploadFile(f, () => this.updateUploadProgress()) : { name: f.name, type: f.type, s3_key: f.s3_key };
        }
        return null;
    }

    async submitForm(ev) {
        ev.preventDefault();
        this.state.message = '';
        this.state.messageType = '';

        // if (this.state.job_type === 'new_socket') {
        //     if (!this.state.new_socket_installations.length) {
        //         this.state.message = 'At least one socket required.';
        //         this.state.messageType = 'alert-danger';
        //         return;
        //     }
        //     if (!this.state.fuse_board_photo_attachment) {
        //         this.state.message = 'Fuse board photo required.';
        //         this.state.messageType = 'alert-danger';
        //         return;
        //     }
        //     if (!this.state.building_type) {
        //         this.state.message = 'Property type is required.';
        //         this.state.messageType = 'alert-danger';
        //         return;
        //     }
        //     if (!this.state.construction_age) {
        //         this.state.message = 'Property age is required.';
        //         this.state.messageType = 'alert-danger';
        //         return;
        //     }
        // }

        const { allPendingFiles, totalUploadSize } = this.collectPendingFiles();
        this.allPendingFiles = allPendingFiles;
        this.totalUploadSize = totalUploadSize;
        if (this.totalUploadSize === 0) {
            this.state.uploadProgress = 100;
        }

        this.state.isSubmitting = true;

        try {
            const headerMetadata = {};
            for (const key of this.headerKeys) {
                headerMetadata[key] = await this.getMetadata(this.state[key] ? [this.state[key]] : [], false);
            }

            const socketMetadata = await Promise.all(this.state.new_socket_installations.map(async line => ({
                location_photo_attachments: await this.getMetadata(line.location_photo_attachments, true),
                route_photo_or_video_attachments: await this.getMetadata(line.route_photo_or_video_attachments, true),
            })));

            const generalVideoMetadata = await this.getMetadata(this.state.general_site_video_attachments, true);
            const unknownMetadata = await this.getMetadata(this.state.unknown_attachment ? [this.state.unknown_attachment] : [], false);

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
                ...headerMetadata,
                water_is_present: this.state.water_is_present,
                water_installation_location: this.state.water_installation_location,
                gas_is_present: this.state.gas_is_present,
                gas_installation_location: this.state.gas_installation_location,
                oil_is_present: this.state.oil_is_present,
                oil_installation_location: this.state.oil_installation_location,
                other_services_is_present: this.state.other_services_is_present,
                other_services_description: this.state.other_services_description,
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
                power_rating: this.state.power_rating,
                installation_location: this.state.installation_location,
                ev_comments: this.state.ev_comments,
                ev_attachments: await this.getMetadata(this.state.ev_attachments, true),
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

    get socketStyles() { return SOCKET_STYLES; }
}

const root = document.querySelector('#job_request_form');
if (root) {
    mount(JobRequestForm, root);
} else {
    console.log('No #job_request_form element found, skipping mount');
}