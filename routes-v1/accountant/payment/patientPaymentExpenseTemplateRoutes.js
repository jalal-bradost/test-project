const {validate} = require("../../../validations/validation");
const {
    patientPaymentExpenseTemplateCreationValidationRules,
    patientPaymentExpenseTemplateUpdateValidationRules,
    patientPaymentExpenseTemplateDeletionValidationRules,
} = require("../../../validations/accountant/patientPaymentExpenseTemplateValidations");
const requirePermissions = require("../../../middlware/requirePermissions");
const permissionsMap = require("../../../utils/permissionMap");
const router = require("../../../config/express");
const {
    createPatientPaymentExpenseTemplate,
    updatePatientPaymentExpenseTemplate,
    deletePatientPaymentExpenseTemplate,
    getPatientPaymentExpenseTemplates,
    getPatientPaymentExpenseTemplate,
} = require("../../../controllers/accountant/payment/patientPaymentExpenseTemplateController");

router.post(
    "/v1/patient-payment-expense-templates",
    requirePermissions([permissionsMap.accountant]),
    patientPaymentExpenseTemplateCreationValidationRules(),
    validate,
    createPatientPaymentExpenseTemplate
);

router.put(
    "/v1/patient-payment-expense-templates/:patientPaymentExpenseTemplateId",
    requirePermissions([permissionsMap.accountant]),
    patientPaymentExpenseTemplateUpdateValidationRules(),
    validate,
    updatePatientPaymentExpenseTemplate
);

router.delete(
    "/v1/patient-payment-expense-templates/:patientPaymentExpenseTemplateId",
    requirePermissions([permissionsMap.accountant]),
    patientPaymentExpenseTemplateDeletionValidationRules(),
    validate,
    deletePatientPaymentExpenseTemplate
);

router.get(
    "/v1/patient-payment-expense-templates",
    requirePermissions([permissionsMap.accountant]),
    getPatientPaymentExpenseTemplates
);

router.get(
    "/v1/patient-payment-expense-templates/:patientPaymentExpenseTemplateId",
    requirePermissions([permissionsMap.accountant]),
    getPatientPaymentExpenseTemplate
);