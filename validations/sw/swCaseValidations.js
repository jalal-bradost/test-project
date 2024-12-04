const {body, param} = require('express-validator');
const {SwCase, SurgeryCase} = require("../../models");

const swCaseCreationValidationRules = () => {
    return [
        body('surgeryCaseId')
            .isInt()
            .custom(async (surgeryCaseId) => {
                const surgeryCase = await SurgeryCase.findByPk(surgeryCaseId);
                if (!surgeryCase) {
                    throw new Error('Surgery case is not found');
                }
            }),
        body('entryTime').isISO8601().toDate(),
        body('exitTime').optional().isISO8601().toDate(),
    ];
};

const swCaseUpdateValidationRules = () => {
    return [
        body('entryTime').isISO8601().toDate(),
        body('exitTime').optional().isDate(),
        swCaseIdValidation,
    ];
};

const swCaseIdValidation = param('swCaseId')
    .notEmpty()
    .isInt()
    .custom(async (swCaseId) => {
        const swCase = await SwCase.findByPk(swCaseId);
        if (!swCase) {
            throw new Error('SW case is not found');
        }
    })
    .bail();

module.exports = {
    swCaseCreationValidationRules,
    swCaseUpdateValidationRules,
    swCaseIdValidation,
}