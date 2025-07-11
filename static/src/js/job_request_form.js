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
                uploadProgress: 0,
            });
            this.formRef = useRef('form');

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

        clearInvalidClasses() {
            validationUtils.clearInvalidClasses(this.formRef.el);
        }

        validateCurrentStep() {
            return validationUtils.validateCurrentStep(this.state, this.formRef.el);
        }

        nextStep() {
            this.clearInvalidClasses();
            this.state.message = ''; // Clear previous message
            if (this.validateCurrentStep()) {
                if (this.state.current_step < this.state.total_steps) {
                    if (this.state.current_step === 3 && this.state.job_type === 'new_socket' && this.state.socket_lines.length === 0) {
                        this.addSocketLine(); // Add initial socket when entering step 4
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
                    name: this.state.name,
                    email: this.state.email,
                    phone: this.state.phone,
                    job_type: this.state.job_type,
                    customer_notes: this.state.customer_notes,
                    property_type: this.state.property_type,
                    property_age: this.state.property_age,
                    // foundation_type: this.state.foundation_type,
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