odoo.define('electrical_job_request.validation_utils', [], function (require) {
    'use strict';

    function clearInvalidClasses(formEl) {
        formEl.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    }

    function validateCurrentStep(state, formEl) {
        let invalidFields = [];
        let errorMessage = 'Please fill all required fields correctly in this step.';

        if (state.current_step === 4 && state.job_type === 'new_socket') {
            if (state.socket_lines.length === 0) {
                state.message = 'Please add at least one socket.';
                state.messageType = 'alert-danger';
                return false;
            }
        }

        invalidFields = [...formEl.querySelectorAll('[required]')].filter(el => !el.checkValidity());

        if (invalidFields.length > 0) {
            invalidFields.forEach(el => el.classList.add('is-invalid'));
            if (invalidFields[0]) invalidFields[0].focus();
            state.message = errorMessage;
            state.messageType = 'alert-danger';
            return false;
        }

        return true;
    }

    return {
        clearInvalidClasses,
        validateCurrentStep,
    };
});