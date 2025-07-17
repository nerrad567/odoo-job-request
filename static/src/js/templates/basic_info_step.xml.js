// static/src/js/templates/basic_info_step.xml.js
import { xml } from "@odoo/owl";

export const basicInfoStepTemplate = xml`
<h3>Step 1: Basic Information</h3>
<div class="form-group">
    <label for="first_name">First Name <span style="color: red;">*</span></label>
    <input type="text" id="first_name" t-model="state.first_name" class="form-control" autocapitalize="words"/>
</div>
<div class="form-group">
    <label for="email">Email <span style="color: red;">*</span></label>
    <input type="email" id="email" t-model="state.email" class="form-control"/>
</div>
<div class="form-group">
    <label for="mobile">Mobile</label>
    <input type="tel" id="mobile" t-model="state.mobile" class="form-control" title="Enter a valid UK mobile number (e.g., 07123 456789 or +447123456789)"/>
</div>
<div class="form-group">
    <label for="postcode">Postcode <span style="color: red;">*</span></label>
    <input type="text" id="postcode" t-model="state.postcode" class="form-control" maxlength="10"/>
</div>
<div class="form-group">
    <label>Job Type <span style="color: red;">*</span></label>
    <div class="accordion" id="jobTypeAccordion">
        <t t-foreach="categories" t-as="cat" t-key="cat.value">
            <div class="accordion-item">
                <h2 t-att-id="'heading_' + cat.value" class="accordion-header">
                    <button t-att-class="'accordion-button d-flex align-items-center ' + (state.activeCategory === cat.value ? '' : 'collapsed')" type="button" data-bs-toggle="collapse" t-att-data-bs-target="'#collapse_' + cat.value" t-att-aria-expanded="state.activeCategory === cat.value ? 'true' : 'false'" t-att-aria-controls="'collapse_' + cat.value" t-on-click="() => this.toggleCategory(cat.value)">
                        <i t-att-class="'fa ' + cat.icon + ' fa-lg p-2 me-2'" aria-hidden="true"/>
                        <t t-esc="cat.label"/>
                    </button>
                </h2>
                <div t-att-id="'collapse_' + cat.value" t-att-class="'accordion-collapse collapse ' + (state.activeCategory === cat.value ? 'show' : '')" t-att-aria-labelledby="'heading_' + cat.value" data-bs-parent="#jobTypeAccordion">
                    <div class="accordion-body">
                        <div class="row">
                            <t t-foreach="cat.jobs" t-as="job" t-key="job.value">
                                <div class="col-md-4 mb-3">
                                    <div t-att-class="'card job-type-card position-relative ' + (state.job_type === job.value ? 'active' : '')" t-on-click="() => this.selectJobType(job.value)">
                                        <div class="card-body text-center">
                                            <i t-att-class="'fa ' + job.icon + ' fa-3x mb-2'"/>
                                            <h5 class="card-title font-weight-bold"><t t-esc="job.label"/></h5>
                                        </div>
                                        <i t-if="state.job_type === job.value" class="fa fa-check check-icon fa-2x"></i>
                                    </div>
                                </div>
                            </t>
                        </div>
                    </div>
                </div>
            </div>
        </t>
    </div>
</div>
`;