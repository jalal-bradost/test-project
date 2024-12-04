const {validate} = require("../../../validations/validation");
const {
    surgeryTypePricingTemplateCreationValidationRules,
    surgeryTypePricingTemplateUpdateValidationRules,
    surgeryTypePricingTemplateDeletionValidationRules,
} = require("../../../validations/surgery/surgeryTypePricingTemplateValidations");
const requirePermissions = require("../../../middlware/requirePermissions");
const permissionsMap = require("../../../utils/permissionMap");
const router = require("../../../config/express");
const {
    createSurgeryTypePricingTemplate,
    updateSurgeryTypePricingTemplate,
    deleteSurgeryTypePricingTemplate,
    getSurgeryTypePricingTemplates,
    getSurgeryTypePricingTemplate,
} = require("../../../controllers/accountant/surgery/surgeryTypePricingTemplateController");

router.post(
    "/v1/surgery-type-pricing-templates",
    requirePermissions([permissionsMap.accountant]),
    surgeryTypePricingTemplateCreationValidationRules(),
    validate,
    createSurgeryTypePricingTemplate
);

router.put(
    "/v1/surgery-type-pricing-templates/:surgeryTypePricingTemplateId",
    requirePermissions([permissionsMap.accountant]),
    surgeryTypePricingTemplateUpdateValidationRules(),
    validate,
    updateSurgeryTypePricingTemplate
);

router.delete(
    "/v1/surgery-type-pricing-templates/:surgeryTypePricingTemplateId",
    requirePermissions([permissionsMap.accountant]),
    surgeryTypePricingTemplateDeletionValidationRules(),
    validate,
    deleteSurgeryTypePricingTemplate
);

router.get(
    "/v1/surgery-type-pricing-templates",
    requirePermissions([permissionsMap.accountant]),
    getSurgeryTypePricingTemplates
);

router.get(
    "/v1/surgery-type-pricing-templates/:surgeryTypePricingTemplateId",
    requirePermissions([permissionsMap.accountant]),
    getSurgeryTypePricingTemplate
);