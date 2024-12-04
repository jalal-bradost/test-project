const {body, param} = require('express-validator');
const {ScrubNurseCase, Patient} = require("../../models");

const scrubNurseCaseCreationValidationRules = () => {
    return [
        body('patientId')
            .isInt()
            .custom(async (patientId) => {
                const patient = await Patient.findByPk(patientId);
                if (!patient) {
                    throw new Error('Patient is not found');
                }
            }),
        body("entryTime").isISO8601().toDate(),
        body("exitTime").optional().isISO8601().toDate(),
    ];
};

const scrubNurseCaseUpdateValidationRules = () => {
    return [
        scrubNurseCaseIdValidation,
        body("entryTime").isISO8601().toDate(),
        body("exitTime").optional().isISO8601().toDate(),
    ];
};

const scrubNurseCaseIdValidation = param('scrubNurseCaseId')
    .notEmpty()
    .isInt()
    .custom(async (scrubNurseCaseId) => {
        const scrubNurseCase = await ScrubNurseCase.findByPk(scrubNurseCaseId);
        if (!scrubNurseCase) {
            throw new Error('ScrubNurse case is not found');
        }
    })
    .bail();

module.exports = {
    scrubNurseCaseCreationValidationRules,
    scrubNurseCaseUpdateValidationRules,
    scrubNurseCaseIdValidation,
}