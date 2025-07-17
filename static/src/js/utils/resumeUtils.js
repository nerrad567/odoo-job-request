// static/src/js/utils/resumeUtils.js
import { rpc } from "@web/core/network/rpc";

export function loadLocalDraft(state) {
    console.log('Setup - Checking localStorage...');
    const savedState = localStorage.getItem('jobRequestFormState');
    if (savedState) {
        console.log('Found saved data:', savedState);
        try {
            const parsed = JSON.parse(savedState);
            if (Date.now() - parsed.savedAt < 86400000 && !state.resume_code) {
                Object.assign(state, parsed);
                state.message = 'Form restored from local draft.';
                console.log('Restored:', parsed);
            } else {
                localStorage.removeItem('jobRequestFormState');
                console.log('Expired or skipped restore');
            }
        } catch (e) {
            console.error('Restore error:', e);
            localStorage.removeItem('jobRequestFormState');
        }
    } else {
        console.log('No saved data');
    }
}

export function saveLocalDraft(state) {
    console.log('Attempting save - Current state:', state);
    const toSave = {
        first_name: state.first_name,
        email: state.email,
        mobile: state.mobile,
        postcode: state.postcode,
        job_type: state.job_type,
        current_step: state.current_step,
        savedAt: Date.now()
    };
    try {
        localStorage.setItem('jobRequestFormState', JSON.stringify(toSave));
        console.log('Saved:', toSave);
    } catch (e) {
        console.error('Save error:', e);
    }
}

export async function loadRemoteResume(state) {
    const resumeCode = document.getElementById('job_request_form')?.dataset.resumeCode || '';
    if (resumeCode) {
        try {
            const response = await rpc('/job-request/resume', { code: resumeCode });
            if (response.status === 'success') {
                const loadedData = response.data;
                state.job_type = loadedData.job_type;
                Object.assign(state, loadedData.job_specific);
                state.message = 'Form resumed successfully.';
                state.messageType = 'alert-success';
                return true;  // For calling updateTotalSteps
            } else {
                state.message = response.message;
                state.messageType = 'alert-danger';
            }
        } catch (error) {
            state.message = 'Error resuming form.';
            state.messageType = 'alert-danger';
        }
    }
    return false;
}