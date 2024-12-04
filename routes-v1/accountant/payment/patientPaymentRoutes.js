const {validate} = require("../../../validations/validation");
const {
    patientPaymentCreationValidationRules,
    patientPaymentUpdateValidationRules,
    patientPaymentDeletionValidationRules,
    patientPaymentInsuranceUpdateValidationRules, patientPaymentIdValidation, fromToDateValidationRules
} = require("../../../validations/accountant/patientPaymentValidations");
const requirePermissions = require("../../../middlware/requirePermissions");
const permissionsMap = require("../../../utils/permissionMap");
const router = require("../../../config/express");
const {
    createPatientPayment,
    updatePatientPayment,
    deletePatientPayment,
    getPatientPayments,
    getPatientPayment,
    closePatientPayment,
    updatePatientPaymentInsurance, previewClosePatientPayment
} = require("../../../controllers/accountant/payment/patientPaymentController");

router.post(
    "/v1/accountant/patient-payments",
    requirePermissions([permissionsMap.accountant]),
    patientPaymentCreationValidationRules(),
    validate,
    createPatientPayment
);

router.put(
    "/v1/accountant/patient-payments/:patientPaymentId",
    requirePermissions([permissionsMap.accountant]),
    patientPaymentUpdateValidationRules(),
    validate,
    updatePatientPayment
);

router.put(
    "/v1/accountant/patient-payments/:patientPaymentId/insurance",
    requirePermissions([permissionsMap.accountant]),
    patientPaymentInsuranceUpdateValidationRules(),
    validate,
    updatePatientPaymentInsurance
);

router.put(
    "/v1/accountant/patient-payments/:patientPaymentId/close",
    requirePermissions([permissionsMap.accountant]),
    patientPaymentIdValidation,
    validate,
    closePatientPayment
);

router.get(
    "/v1/accountant/patient-payments/:patientPaymentId/close",
    requirePermissions([permissionsMap.accountant]),
    patientPaymentIdValidation,
    validate,
    previewClosePatientPayment
);

router.delete(
    "/v1/accountant/patient-payments/:patientPaymentId",
    requirePermissions([permissionsMap.accountant]),
    patientPaymentDeletionValidationRules(),
    validate,
    deletePatientPayment
);

router.get(
    "/v1/accountant/patient-payments",
    requirePermissions([permissionsMap.accountant]),
    fromToDateValidationRules(),
    getPatientPayments
);

router.get(
    "/v1/accountant/patient-payments/:patientPaymentId",
    requirePermissions([permissionsMap.accountant]),
    patientPaymentIdValidation,
    getPatientPayment
);