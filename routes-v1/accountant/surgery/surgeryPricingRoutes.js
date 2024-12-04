const {validate} = require("../../../validations/validation");
const {
    surgeryPricingCreationValidationRules,
    surgeryPricingUpdateValidationRules,
    surgeryPricingDeletionValidationRules, surgeryPricingPayValidationRules
} = require("../../../validations/surgery/surgeryPricingValidations");
const requirePermissions = require("../../../middlware/requirePermissions");
const permissionsMap = require("../../../utils/permissionMap");
const router = require("../../../config/express");
const {
    createSurgeryPricing,
    updateSurgeryPricing,
    deleteSurgeryPricing,
    getSurgeryPricings,
    getSurgeryPricing, paySurgeryPricing
} = require("../../../controllers/accountant/surgery/surgeryPricingController");

router.post(
    '/v1/surgery-pricings',
    requirePermissions([permissionsMap.accountant, permissionsMap.surgeryStaff]),
    surgeryPricingCreationValidationRules(),
    validate,
    createSurgeryPricing
);

router.put(
    '/v1/surgery-pricings/:surgeryPricingId',
    requirePermissions([permissionsMap.accountant]),
    surgeryPricingUpdateValidationRules(),
    validate,
    updateSurgeryPricing
);

router.put(
    '/v1/surgery-pricings/:surgeryPricingId/pay',
    requirePermissions([permissionsMap.accountant]),
    surgeryPricingPayValidationRules(),
    validate,
    paySurgeryPricing
);

router.delete(
    '/v1/surgery-pricings/:surgeryPricingId',
    requirePermissions([permissionsMap.accountant]),
    surgeryPricingDeletionValidationRules(),
    validate,
    deleteSurgeryPricing
);

router.get(
    '/v1/surgery-pricings',
    requirePermissions([permissionsMap.accountant]),
    getSurgeryPricings
);

router.get(
    '/v1/surgery-pricings/:surgeryPricingId',
    requirePermissions([permissionsMap.accountant]),
    getSurgeryPricing
);