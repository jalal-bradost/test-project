const {body, param} = require('express-validator');
const {PatientPaymentExpense, PatientPayment} = require("../../models");

const patientPaymentExpenseCreationValidationRules = () => {
    return [
        body('patientPaymentId')
            .notEmpty()
            .isInt()
            .custom(async (patientPaymentId) => {
                const payment = await PatientPayment.findByPk(patientPaymentId);
                if (!payment) {
                    throw new Error('Payment not found');
                }
            }),
        body('name')
            .notEmpty()
            .isString(),
        body('price')
            .notEmpty()
            .isInt()
    ];
};

const patientPaymentExpenseUpdateValidationRules = () => {
    return [
        patientPaymentExpenseIdValidation,
        body('name')
            .notEmpty()
            .isString(),
        body('price')
            .notEmpty()
            .isInt()
    ];
};

const patientPaymentExpenseBatchCreationValidationRules = () => {
    return [
        body('*.patientPaymentId')
            .notEmpty()
            .isInt()
            .custom(async (patientPaymentId) => {
                const payment = await PatientPayment.findByPk(patientPaymentId);
                if (!payment) {
                    throw new Error('Payment not found');
                }
            }),
        body('*.name')
            .notEmpty()
            .isString(),
        body('*.price')
            .notEmpty()
            .isInt()
    ];
};


const patientPaymentExpenseDeletionValidationRules = () => {
    return [patientPaymentExpenseIdValidation];
};

const patientPaymentExpenseIdValidation = param('patientPaymentExpenseId')
    .notEmpty()
    .isInt()
    .custom(async (patientPaymentExpenseId, {req}) => {
        const patientPaymentExpense = await PatientPaymentExpense.findByPk(patientPaymentExpenseId);
        if (!patientPaymentExpense) {
            throw new Error('Surgery Pricing not found');
        }
        req.patientPaymentExpense = patientPaymentExpense;
    })
    .bail();

module.exports = {
    patientPaymentExpenseCreationValidationRules,
    patientPaymentExpenseDeletionValidationRules,
    patientPaymentExpenseBatchCreationValidationRules,
    patientPaymentExpenseUpdateValidationRules,
    patientPaymentExpenseIdValidation,
};