const {body, param} = require('express-validator');
const {IcuCase, SurgeryCase} = require("../../models");

const icuCaseCreationValidationRules = () => {
    return [
        body('surgeryCaseId')
            .optional()
            .isInt()
            .custom(async (surgeryCaseId) => {
                if (surgeryCaseId) {
                    const surgeryCase = await SurgeryCase.findByPk(surgeryCaseId);
                    if (!surgeryCase) {
                        throw new Error('Surgery case is not found');
                    }
                }
            }),
        body('entryTime').isISO8601().toDate(),
        body('exitTime').optional().isISO8601().toDate(),
    ];
};

const icuCaseUpdateValidationRules = () => {
    return [
        body('entryTime').isISO8601().toDate(),
        body('exitTime').optional().isDate(),
        icuCaseIdValidation,
    ];
};

const icuCaseIdValidation = param('icuCaseId')
    .notEmpty()
    .isInt()
    .custom(async (icuCaseId) => {
        const icuCase = await IcuCase.findByPk(icuCaseId);
        if (!icuCase) {
            throw new Error('ICU case is not found');
        }
    })
    .bail();

module.exports = {
    icuCaseCreationValidationRules,
    icuCaseUpdateValidationRules,
    icuCaseIdValidation,
}