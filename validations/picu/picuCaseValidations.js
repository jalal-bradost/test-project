const {body, param} = require('express-validator');
const {PicuCase, Patient} = require("../../models");

const picuCaseCreationValidationRules = () => {
    return [
        body('patientId')
            .isInt()
            .custom(async (patientId) => {
                const patient = await Patient.findByPk(patientId);
                if (!patient) {
                    throw new Error('Patient is not found');
                }
            }),
    ];
};

const picuCaseUpdateValidationRules = () => {
    return [
        picuCaseIdValidation,
        body("notes").optional().isArray(),
    ];
};

const picuCaseIdValidation = param('picuCaseId')
    .notEmpty()
    .isInt()
    .custom(async (picuCaseId) => {
        const picuCase = await PicuCase.findByPk(picuCaseId);
        if (!picuCase) {
            throw new Error('PICU case is not found');
        }
    })
    .bail();

module.exports = {
    picuCaseCreationValidationRules,
    picuCaseUpdateValidationRules,
    picuCaseIdValidation,
}