const {body, param} = require('express-validator');
const {SurgeryPricing, SurgeryCase, Employee, Currency} = require("../../models");

const surgeryPricingCreationValidationRules = () => {
    return [
        body('surgeryCaseId')
            .notEmpty()
            .isInt()
            .custom(async (surgeryCaseId) => {
                const caseInstance = await SurgeryCase.findByPk(surgeryCaseId);
                if (!caseInstance) {
                    throw new Error('Surgery Case not found');
                }
            }),
        body('employeeId')
            .notEmpty()
            .isInt()
            .custom(async (employeeId) => {
                const employee = await Employee.findByPk(employeeId);
                if (!employee) {
                    throw new Error('Employee not found');
                }
            }),
        body('currencyId')
            .notEmpty()
            .isInt()
            .isInt({min: 0, max: 1}),
        body('fee')
            .notEmpty()
            .isFloat(),
        body('feeTypeId')
            .notEmpty()
            .isInt({min: 0, max: 1}),
    ];
};

const surgeryPricingUpdateValidationRules = () => {
    return [
        body('surgeryCaseId')
            .optional()
            .isInt()
            .custom(async (surgeryCaseId) => {
                if (surgeryCaseId) {
                    const caseInstance = await SurgeryCase.findByPk(surgeryCaseId);
                    if (!caseInstance) {
                        throw new Error('Surgery Case not found');
                    }
                }
            }),
        body('employeeId')
            .optional()
            .isInt()
            .custom(async (employeeId) => {
                if (employeeId) {
                    const employee = await Employee.findByPk(employeeId);
                    if (!employee) {
                        throw new Error('Employee not found');
                    }
                }
            }),
        body('currencyId')
            .optional()
            .isInt({min: 0, max: 1}),
        body('fee')
            .optional()
            .isFloat(),
        body('feeTypeId')
            .optional()
            .isInt({min: 0, max: 1}),
        surgeryPricingIdValidation,
    ];
};

const surgeryPricingDeletionValidationRules = () => {
    return [surgeryPricingIdValidation];
};

const surgeryPricingPayValidationRules = () => {
    return [
        body('exchangeRate').isInt({min: 1320, max: 1700}),
        surgeryPricingIdValidation];
};

const surgeryPricingIdValidation = param('surgeryPricingId')
    .notEmpty()
    .isInt()
    .custom(async (surgeryPricingId) => {
        const surgeryPricing = await SurgeryPricing.findByPk(surgeryPricingId);
        if (!surgeryPricing) {
            throw new Error('Surgery Pricing not found');
        }
    })
    .bail();

module.exports = {
    surgeryPricingCreationValidationRules,
    surgeryPricingUpdateValidationRules,
    surgeryPricingDeletionValidationRules,
    surgeryPricingIdValidation,
    surgeryPricingPayValidationRules
};