const {body, param} = require('express-validator');
const {AnesthesiaCase, Patient} = require("../../models");

const anesthesiaCaseCreationValidationRules = () => {
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

const anesthesiaCaseUpdateValidationRules = () => {
    return [
        anesthesiaCaseIdValidation,
        body("entryTime").isISO8601().toDate(),
        body("exitTime").optional().isISO8601().toDate(),
    ];
};

const anesthesiaCaseIdValidation = param('anesthesiaCaseId')
    .notEmpty()
    .isInt()
    .custom(async (anesthesiaCaseId) => {
        const anesthesiaCase = await AnesthesiaCase.findByPk(anesthesiaCaseId);
        if (!anesthesiaCase) {
            throw new Error('Anesthesia case is not found');
        }
    })
    .bail();

module.exports = {
    anesthesiaCaseCreationValidationRules,
    anesthesiaCaseUpdateValidationRules,
    anesthesiaCaseIdValidation,
}