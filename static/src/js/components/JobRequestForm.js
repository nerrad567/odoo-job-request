/** @odoo-module **/
// static/src/js/components/JobRequestForm.js
import { Component, useState, onMounted, useRef, mount } from "@odoo/owl";
import { rpc } from "@web/core/network/rpc";
import * as validationUtils from "../utils/validation_utils.js";  // Relative path
import * as fileUtils from "../utils/file_utils.js";
import { template } from "../templates/form_steps.xml.js";  // Import template
import { CATEGORIES, SOCKET_STYLES, STEP_COUNTS } from "../constants.js";  // Import constants

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
            other_photo_attachment: null,
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
        this.headerKeys = ['fuse_board_photo_attachment', 'water_photo_attachment', 'gas_photo_attachment', 'oil_photo_attachment', 'other_photo_attachment'];

        onMounted(() => {
            console.log('JobRequestForm mounted');
            if (this.props.resume_code) {
                this.loadResume(this.props.resume_code);
            }
        });
    }

    get categories() { return CATEGORIES; }  // Use imported consts
    get socketStyles() { return SOCKET_STYLES; }
    getTotalStepsForJob(jobType) { return STEP_COUNTS[jobType] || 2; }

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
        return validationUtils.validateCurrentStep(this.state, this.formRef.el);
    }

    validateField(field) {
        const value = this.state[field];
        let error = '';

        this.state.errors[field] = error;
    }

    validatePostcode() {
        let pc = this.state.postcode.trim().toUpperCase().replace(/\s+/g, '');
    }

    nextStep() {
        this.clearInvalidClasses();
        this.state.message = '';

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
        ];
        const allPendingFiles = fileSources.flatMap(source => source.files.filter(f => f.status === 'pending'));
        const totalUploadSize = allPendingFiles.reduce((sum, f) => sum + (f.size || 0), 0);
        return { allPendingFiles, totalUploadSize };
    }

    async getMetadata(files, isArray) {
        if (isArray) {
            return Promise.all(files.map(async f => f.status === 'pending' ? await this.uploadFile(f, () => this.updateUploadProgress()) : { id: f.id, name: f.name, type: f.type || 'application/octet-stream', s3_key: f.s3_key }));  // Add id
        } else if (files.length) {
            const f = files[0];
            return f.status === 'pending' ? await this.uploadFile(f, () => this.updateUploadProgress()) : { id: f.id, name: f.name, type: f.type || 'application/octet-stream', s3_key: f.s3_key };  // Add id
        }
        return null;
    }

    async submitForm(ev) {
        ev.preventDefault();
        this.state.message = '';
        this.state.messageType = '';

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
}

const root = document.querySelector('#job_request_form');
if (root) {
    mount(JobRequestForm, root);
} else {
    console.log('No #job_request_form element found, skipping mount');
}