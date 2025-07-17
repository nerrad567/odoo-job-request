/** @odoo-module **/
// static/src/js/components/JobRequestForm.js
import { Component, useState, onMounted, useRef, onWillDestroy, useEffect, mount } from "@odoo/owl";
import { rpc } from "@web/core/network/rpc";
import * as fileUtils from "../utils/file_utils.js";
import { template } from "../templates/form_steps.xml.js"; 
import { CATEGORIES, SOCKET_STYLES, STEP_COUNTS } from "../constants.js";
import { initialFormState } from "../state/initialFormState.js";
import * as resumeUtils from "../utils/resumeUtils.js";
import * as socketUtils from "../utils/socketUtils.js";
import * as formUtils from "../utils/formUtils.js";
import * as submitUtils from "../utils/submitUtils.js";

class JobRequestForm extends Component {
    static template = template;

    setup() {
        this.state = useState(initialFormState);
        this.formRef = useRef('form');
        this.headerKeys = ['fuse_board_photo_attachment', 'water_photo_attachment', 'gas_photo_attachment', 'oil_photo_attachment', 'other_photo_attachment'];

        console.log('Imported fileUtils:', fileUtils);  // Debug to check if fileUtils is loaded correctly

        resumeUtils.loadLocalDraft(this.state);

        const saveState = () => resumeUtils.saveLocalDraft(this.state);

        useEffect(saveState, () => [
            this.state.first_name, this.state.email, this.state.mobile, 
            this.state.postcode, this.state.job_type, this.state.current_step
        ]);

        onWillDestroy(saveState);

        onMounted(async () => {
            const resumed = await resumeUtils.loadRemoteResume(this.state);
            if (resumed) this.updateTotalSteps();
        });
    }

    get categories() { return CATEGORIES; }
    get socketStyles() { return SOCKET_STYLES; }

    getCategoryOfJob = (jobType) => formUtils.getCategoryOfJob(this.categories, jobType);

    toggleCategory = (value) => formUtils.toggleCategory(this.state, value);

    selectJobType = (value) => formUtils.selectJobType(this.state, value, this.categories, socketUtils.prepopulateSockets, STEP_COUNTS);

    updateTotalSteps = () => formUtils.updateTotalSteps(this.state, STEP_COUNTS);

    prepopulateSockets = () => socketUtils.prepopulateSockets(this.state);

    addSocketLine = () => socketUtils.addSocketLine(this.state);

    removeSocketLine = (index) => socketUtils.removeSocketLine(this.state, index);

    validatePostcode = () => formUtils.validatePostcode(this.state);

    nextStep = () => formUtils.nextStep(this.state, this.addSocketLine);

    prevStep = () => formUtils.prevStep(this.state);

    handleSingleFileChange = async (key, ev) => {
        console.log('Calling handleSingleFileChange', key, ev.target.files);  // Debug call
        await fileUtils.handleSingleFileChange(ev, key, this.state);
    }

    handleMultiFileChange = async (key, ev, allowedTypes, lineIndex = null) => await fileUtils.handleMultiFileChange(ev, lineIndex, key, allowedTypes, this.state);

    handleRemoveSingle = async (key) => {
        const file = this.state[key];
        if (file && file.id) {
            await rpc('/job-request/delete-attachment', { attachment_ids: file.id });
        }
        this.state[key] = null;
    }

    handleRemoveFromArray = async (key, fileIndex, lineIndex = null) => {
        const target = lineIndex !== null ? this.state.new_socket_installations[lineIndex][key] : this.state[key];
        const file = target[fileIndex];
        if (file.id) {
            await rpc('/job-request/delete-attachment', { attachment_ids: file.id });
        }
        target.splice(fileIndex, 1);
    }

    uploadFile = async (fileObj, updateProgressCallback) => await fileUtils.uploadFile(fileObj, updateProgressCallback);

    updateUploadProgress = () => submitUtils.updateUploadProgress(this.state, this.allPendingFiles, this.totalUploadSize);

    collectPendingFiles = () => submitUtils.collectPendingFiles(this.state, this.headerKeys);

    getMetadata = async (files, isArray) => await submitUtils.getMetadata(files, isArray, this.uploadFile, this.updateUploadProgress);

    submitForm = async (ev) => {
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
            const formData = await submitUtils.buildFormData(this.state, this.headerKeys, this.getMetadata, rpc);
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