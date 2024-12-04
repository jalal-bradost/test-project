const {body, param} = require('express-validator');
const {PatientPaymentExpenseCategory} = require("../../models");

const patientPaymentExpenseCategoryCreationValidationRules = () => {
    return [
        body('name')
            .notEmpty()
            .isString()
    ];
};

const patientPaymentExpenseCategoryModificationValidationRules = () => {
    return [
        patientPaymentExpenseCategoryCreationValidationRules(),
        patientPaymentExpenseCategoryIdValidation
    ]
}


const patientPaymentExpenseCategoryDeletionValidationRules = () => {
    return [patientPaymentExpenseCategoryIdValidation];
};

const patientPaymentExpenseCategoryIdValidation = param('categoryId')
    .notEmpty()
    .isInt()
    .custom(async (categoryId) => {
        const patientPaymentExpenseCategory = await PatientPaymentExpenseCategory.findByPk(categoryId);
        if (!patientPaymentExpenseCategory) {
            throw new Error('Category not found');
        }
    })
    .bail();

module.exports = {
    patientPaymentExpenseCategoryCreationValidationRules,
    patientPaymentExpenseCategoryDeletionValidationRules,
    patientPaymentExpenseCategoryIdValidation,
    patientPaymentExpenseCategoryModificationValidationRules
};