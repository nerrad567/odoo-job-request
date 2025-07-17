// static/src/js/utils/formUtils.js
export function getCategoryOfJob(categories, jobType) {
    for (let cat of categories) {
        if (cat.jobs.some(j => j.value === jobType)) {
            return cat.value;
        }
    }
    return null;
}

export function toggleCategory(state, value) {
    state.activeCategory = state.activeCategory === value ? null : value;
}

export function selectJobType(state, value, categories, prepopulateSockets, STEP_COUNTS) {
    state.job_type = value;
    state.activeCategory = getCategoryOfJob(categories, value);
    updateTotalSteps(state, STEP_COUNTS);
    if (value === 'new_socket') {
        prepopulateSockets(state);
    }
}

export function updateTotalSteps(state, STEP_COUNTS) {
    state.total_steps = state.job_type ? (STEP_COUNTS[state.job_type] || 2) : 1;
}

export function validatePostcode(state) {
    state.postcode = state.postcode.trim().toUpperCase().replace(/\s+/g, ' ');
}

export function nextStep(state, addSocketLine) {
    state.message = '';
    if (state.current_step < state.total_steps) {
        if (state.current_step === 3 && state.job_type === 'new_socket' && state.new_socket_installations.length === 0) {
            addSocketLine(state);
        }
        state.current_step++;
    }
}

export function prevStep(state) {
    if (state.current_step > 1) {
        state.current_step--;
        state.message = '';
    }
}