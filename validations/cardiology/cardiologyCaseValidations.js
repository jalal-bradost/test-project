const {body, param} = require('express-validator');
const {CardiologyCase, SurgeryCase} = require("../../models");

const cardiologyCaseCreationValidationRules = () => {
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

const cardiologyCaseUpdateValidationRules = () => {
    return [
        body('entryTime').isISO8601().toDate(),
        body('exitTime').optional().isDate(),
        cardiologyCaseIdValidation,
    ];
};

const cardiologyCaseIdValidation = param('cardiologyCaseId')
    .notEmpty()
    .isInt()
    .custom(async (cardiologyCaseId) => {
        const cardiologyCase = await CardiologyCase.findByPk(cardiologyCaseId);
        if (!cardiologyCase) {
            throw new Error('Cardiology case is not found');
        }
    })
    .bail();

module.exports = {
    cardiologyCaseCreationValidationRules,
    cardiologyCaseUpdateValidationRules,
    cardiologyCaseIdValidation,
}