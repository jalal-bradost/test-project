const {validate} = require("../../../validations/validation");
const {
    surgeryPricingTemplateCreationValidationRules,
    surgeryPricingTemplateUpdateValidationRules,
    surgeryPricingTemplateDeletionValidationRules,
} = require("../../../validations/surgery/surgeryPricingTemplateValidations");
const requirePermissions = require("../../../middlware/requirePermissions");
const permissionsMap = require("../../../utils/permissionMap");
const router = require("../../../config/express");
const {
    createSurgeryPricingTemplate,
    updateSurgeryPricingTemplate,
    deleteSurgeryPricingTemplate,
    getSurgeryPricingTemplates,
    getSurgeryPricingTemplate,
} = require("../../../controllers/accountant/surgery/surgeryPricingTemplateController");

router.post(
    "/v1/surgery-pricing-templates",
    requirePermissions([permissionsMap.accountant]),
    surgeryPricingTemplateCreationValidationRules(),
    validate,
    createSurgeryPricingTemplate
);

router.put(
    "/v1/surgery-pricing-templates/:surgeryPricingTemplateId",
    requirePermissions([permissionsMap.accountant]),
    surgeryPricingTemplateUpdateValidationRules(),
    validate,
    updateSurgeryPricingTemplate
);

router.delete(
    "/v1/surgery-pricing-templates/:surgeryPricingTemplateId",
    requirePermissions([permissionsMap.accountant]),
    surgeryPricingTemplateDeletionValidationRules(),
    validate,
    deleteSurgeryPricingTemplate
);

router.get(
    "/v1/surgery-pricing-templates",
    requirePermissions([permissionsMap.accountant, permissionsMap.surgeryStaff]),
    getSurgeryPricingTemplates
);

router.get(
    "/v1/surgery-pricing-templates/:surgeryPricingTemplateId",
    requirePermissions([permissionsMap.accountant]),
    getSurgeryPricingTemplate
);