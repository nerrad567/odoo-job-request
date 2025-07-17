// static/src/js/templates/form_steps.xml.js
import { xml } from "@odoo/owl";
import { basicInfoStepTemplate } from "./basic_info_step.xml.js";
import { bondingGroundingStepTemplate } from "./bonding_grounding_step.xml.js";
import { fuseBoardStepTemplate } from "./fuse_board_step.xml.js";
import { socketDetailsStepTemplate } from "./socket_details_step.xml.js";
import { additionalNotesStepTemplate } from "./additional_notes_step.xml.js";
import { evChargerStepTemplate } from "./ev_charger_step.xml.js";

export const template = xml`
<div class="job-request-form">
    <h1>Job Request</h1>
    <form t-ref="form" t-on-submit.prevent="submitForm">
        <div t-if="state.current_step === 1">
            <t t-call="${basicInfoStepTemplate}" />
        </div>
        <div t-if="state.job_type === 'new_socket' &amp;&amp; state.current_step === 2">
            <t t-call="${bondingGroundingStepTemplate}" />
        </div>
        <div t-if="state.job_type === 'new_socket' &amp;&amp; state.current_step === 3">
            <t t-call="${fuseBoardStepTemplate}" />
        </div>
        <div t-if="state.job_type === 'new_socket' &amp;&amp; state.current_step === 4">
            <t t-call="${socketDetailsStepTemplate}" />
        </div>
        <div t-if="state.job_type === 'new_socket' &amp;&amp; state.current_step === 5">
            <t t-call="${additionalNotesStepTemplate}" />
        </div>
        <div t-if="state.job_type in ['additional_circuit', 'outbuilding_power', 'ev_charger', 'full_rewire', 'partial_rewire', 'dado_trunking', 'industrial_rewire', 'minor_works', 'structured_cabling', 'ethernet_point'] &amp;&amp; state.current_step === 3">
            <t t-call="${bondingGroundingStepTemplate}" />  // Reused
        </div>
        <div t-if="state.job_type === 'ev_charger' &amp;&amp; state.current_step === 2">
            <t t-call="${evChargerStepTemplate}" />
        </div>
        <div t-if="state.current_step === state.total_steps &amp;&amp; state.job_type &amp;&amp; state.job_type !== 'new_socket'">
            <t t-call="${additionalNotesStepTemplate}" />  // Reused
        </div>
        <div t-if="state.message" t-att-class="state.messageType" class="alert mt-3">
            <t t-esc="state.message"/>
        </div>
        <div class="form-group mt-3">
            <button type="button" t-on-click="prevStep" class="btn btn-secondary" t-if="state.current_step > 1">Back</button>
            <button type="button" t-on-click="nextStep" class="btn btn-primary ml-2" t-if="state.current_step &lt; state.total_steps">Next</button>
            <button type="submit" class="btn btn-primary ml-2" t-if="state.current_step === state.total_steps &amp;&amp; state.job_type" t-att-disabled="state.isSubmitting">Submit Request</button>
            <t t-if="state.isSubmitting">
                <div class="progress mt-2">
                    <div class="progress-bar" role="progressbar" t-att-style="'width: ' + state.uploadProgress + '%'" t-att-aria-valuenow="state.uploadProgress" aria-valuemin="0" aria-valuemax="100"><t t-esc="state.uploadProgress + '%'" /></div>
                </div>
            </t>
        </div>
    </form>
</div>
`;