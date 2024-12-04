const {validate} = require("../../../validations/validation");
const {
    patientPaymentExpenseCategoryCreationValidationRules,
    patientPaymentExpenseCategoryDeletionValidationRules, patientPaymentExpenseCategoryModificationValidationRules
} = require("../../../validations/accountant/patientPaymentExpenseCategoryValidations");
const requirePermissions = require("../../../middlware/requirePermissions");
const permissionsMap = require("../../../utils/permissionMap");
const router = require("../../../config/express");
const {
    createPatientPaymentExpenseCategory,
    deletePatientPaymentExpenseCategory,
    getPatientPaymentExpenseCategorys,
    getPatientPaymentExpenseCategory, updatePatientPaymentExpenseCategory
} = require("../../../controllers/accountant/payment/patientPaymentExpenseCategoryController");

router.post(
    '/v1/accountant/patient-payment-expense-categories',
    requirePermissions([permissionsMap.accountant]),
    patientPaymentExpenseCategoryCreationValidationRules(),
    validate,
    createPatientPaymentExpenseCategory
);

router.put(
    '/v1/accountant/patient-payment-expense-categories/:categoryId',
    requirePermissions([permissionsMap.accountant]),
    patientPaymentExpenseCategoryModificationValidationRules(),
    validate,
    updatePatientPaymentExpenseCategory
);

router.delete(
    '/v1/accountant/patient-payment-expense-categories/:categoryId',
    requirePermissions([permissionsMap.accountant]),
    patientPaymentExpenseCategoryDeletionValidationRules(),
    validate,
    deletePatientPaymentExpenseCategory
);

router.get(
    '/v1/accountant/patient-payment-expense-categories',
    requirePermissions([permissionsMap.accountant]),
    getPatientPaymentExpenseCategorys
);

router.get(
    '/v1/accountant/patient-payment-expense-categories/:categoryId',
    requirePermissions([permissionsMap.accountant]),
    getPatientPaymentExpenseCategory
);