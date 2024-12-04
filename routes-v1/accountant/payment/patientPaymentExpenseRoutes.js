const {validate} = require("../../../validations/validation");
const {
    patientPaymentExpenseCreationValidationRules,
    patientPaymentExpenseDeletionValidationRules, patientPaymentExpenseBatchCreationValidationRules,
    patientPaymentExpenseUpdateValidationRules
} = require("../../../validations/accountant/patientPaymentExpenseValidations");
const requirePermissions = require("../../../middlware/requirePermissions");
const permissionsMap = require("../../../utils/permissionMap");
const router = require("../../../config/express");
const {
    createPatientPaymentExpense,
    deletePatientPaymentExpense,
    getPatientPaymentExpenses,
    getPatientPaymentExpense,
    createBatchPatientPaymentExpense, updatePatientPaymentExpense
} = require("../../../controllers/accountant/payment/patientPaymentExpenseController");

router.post(
    '/v1/accountant/patient-payment-expenses',
    requirePermissions([permissionsMap.accountant]),
    patientPaymentExpenseCreationValidationRules(),
    validate,
    createPatientPaymentExpense
);

router.put(
    '/v1/accountant/patient-payment-expenses/:patientPaymentExpenseId',
    requirePermissions([permissionsMap.accountant]),
    patientPaymentExpenseUpdateValidationRules(),
    validate,
    updatePatientPaymentExpense
);

router.post(
    '/v1/accountant/patient-payment-expenses/batch',
    requirePermissions([permissionsMap.accountant]),
    patientPaymentExpenseBatchCreationValidationRules(),
    validate,
    createBatchPatientPaymentExpense
);

router.delete(
    '/v1/accountant/patient-payment-expenses/:patientPaymentExpenseId',
    requirePermissions([permissionsMap.accountant]),
    patientPaymentExpenseDeletionValidationRules(),
    validate,
    deletePatientPaymentExpense
);

router.get(
    '/v1/accountant/patient-payment-expenses',
    requirePermissions([permissionsMap.accountant]),
    getPatientPaymentExpenses
);

router.get(
    '/v1/accountant/patient-payment-expenses/:patientPaymentExpenseId',
    requirePermissions([permissionsMap.accountant]),
    getPatientPaymentExpense
);