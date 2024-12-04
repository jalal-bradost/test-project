const {body, param} = require('express-validator');
const {PicuPayment, PicuCase} = require("../../models");

const picuPaymentCreationValidationRules = () => {
    return [
        body('picuCaseId')
            .notEmpty()
            .isInt()
            .custom(async (picuCaseId) => {
                const picuCase = await PicuCase.findByPk(picuCaseId);
                if (!picuCase) {
                    throw new Error('Case not found');
                }
            }),
        body('insurance')
            .notEmpty()
            .isFloat(),
        body('times')
            .optional()
            .isObject(),
        body('services')
            .optional()
            .isObject(),
    ];
};

const picuPaymentUpdateValidationRules = () => {
    return [
        picuPaymentCreationValidationRules(),
        picuPaymentIdValidation
    ];
};

const picuPaymentInsuranceUpdateValidationRules = () => {
    return [
        body('insurance')
            .notEmpty()
            .isFloat(),
        picuPaymentIdValidation
    ];
};

const picuPaymentDeletionValidationRules = () => {
    return [picuPaymentIdValidation];
};

const picuPaymentIdValidation = param('picuPaymentId')
    .notEmpty()
    .isInt()
    .custom(async (picuPaymentId) => {
        const picuPayment = await PicuPayment.findByPk(picuPaymentId);
        if (!picuPayment) {
            throw new Error('Picu Payment not found');
        }
    })
    .bail();

module.exports = {
    picuPaymentCreationValidationRules,
    picuPaymentUpdateValidationRules,
    picuPaymentDeletionValidationRules,
    picuPaymentInsuranceUpdateValidationRules,
    picuPaymentIdValidation,
};