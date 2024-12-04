const {body, param} = require("express-validator");
const {PatientPaymentExpenseTemplate, SurgeryType, Currency, FeeType, Role, EmployeeRole} = require("../../models");

const patientPaymentExpenseTemplateCreationValidationRules = () => {
    return [
        body("name").notEmpty().isString(),
        body("price").notEmpty().isInt(),
    ];
};

const patientPaymentExpenseTemplateUpdateValidationRules = () => {
    return [
        body("name").notEmpty().isString(),
        body("price").notEmpty().isInt(),
        patientPaymentExpenseTemplateIdValidation,
    ];
};

const patientPaymentExpenseTemplateDeletionValidationRules = () => {
    return [patientPaymentExpenseTemplateIdValidation];
};

const patientPaymentExpenseTemplateIdValidation = param("patientPaymentExpenseTemplateId")
    .notEmpty()
    .isInt()
    .custom(async (patientPaymentExpenseTemplateId) => {
        const patientPaymentExpenseTemplate = await PatientPaymentExpenseTemplate.findByPk(patientPaymentExpenseTemplateId);
        if (!patientPaymentExpenseTemplate) {
            throw new Error("Patient Payment Expense Template not found");
        }
    })
    .bail();

module.exports = {
    patientPaymentExpenseTemplateCreationValidationRules,
    patientPaymentExpenseTemplateUpdateValidationRules,
    patientPaymentExpenseTemplateDeletionValidationRules,
    patientPaymentExpenseTemplateIdValidation,
};