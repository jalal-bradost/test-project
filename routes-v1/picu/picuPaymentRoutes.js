const {validate} = require("../../validations/validation");
const {
    picuPaymentCreationValidationRules,
    picuPaymentUpdateValidationRules,
    picuPaymentDeletionValidationRules,
    picuPaymentInsuranceUpdateValidationRules, picuPaymentIdValidation
} = require("../../validations/picu/picuPaymentValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createPicuPayment,
    updatePicuPayment,
    deletePicuPayment,
    getPicuPayments,
    getPicuPayment,
    updatePicuPaymentInsurance
} = require("../../controllers/picu/picuPaymentController");

router.post(
    "/v1/picu/payments",
    requirePermissions([permissionsMap.accountant]),
    picuPaymentCreationValidationRules(),
    validate,
    createPicuPayment
);

router.put(
    "/v1/picu/payments/:picuPaymentId",
    requirePermissions([permissionsMap.accountant]),
    picuPaymentUpdateValidationRules(),
    validate,
    updatePicuPayment
);

router.put(
    "/v1/picu/payments/:picuPaymentId/insurance",
    requirePermissions([permissionsMap.accountant]),
    picuPaymentInsuranceUpdateValidationRules(),
    validate,
    updatePicuPaymentInsurance
);

router.delete(
    "/v1/picu/payments/:picuPaymentId",
    requirePermissions([permissionsMap.accountant]),
    picuPaymentDeletionValidationRules(),
    validate,
    deletePicuPayment
);

router.get(
    "/v1/picu/payments",
    requirePermissions([permissionsMap.accountant]),
    getPicuPayments
);

router.get(
    "/v1/picu/payments/:picuPaymentId",
    requirePermissions([permissionsMap.accountant]),
    picuPaymentIdValidation,
    getPicuPayment
);