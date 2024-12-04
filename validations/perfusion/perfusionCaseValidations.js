const {body, param} = require('express-validator');
const {PerfusionCase, Patient} = require("../../models");

const perfusionCaseCreationValidationRules = () => {
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

const perfusionCaseUpdateValidationRules = () => {
    return [
        perfusionCaseIdValidation,
        body("entryTime").isISO8601().toDate(),
        body("exitTime").optional().isISO8601().toDate(),
    ];
};

const perfusionCaseIdValidation = param('perfusionCaseId')
    .notEmpty()
    .isInt()
    .custom(async (perfusionCaseId) => {
        const perfusionCase = await PerfusionCase.findByPk(perfusionCaseId);
        if (!perfusionCase) {
            throw new Error('Perfusion case is not found');
        }
    })
    .bail();

module.exports = {
    perfusionCaseCreationValidationRules,
    perfusionCaseUpdateValidationRules,
    perfusionCaseIdValidation,
}