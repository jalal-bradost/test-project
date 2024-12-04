const {body, param} = require("express-validator");
const {SurgeryCase, Patient, SurgeryType, Employee} = require("../../models");

const surgeryCaseCreationValidationRules = () => {
    return [
        body("patientId")
            .notEmpty()
            .isInt()
            .custom(async (patientId) => {
                const patient = await Patient.findByPk(patientId);
                if (!patient) {
                    throw new Error("Patient not found");
                }
            }),
        body("surgeryTypeId")
            .notEmpty()
            .isInt()
            .custom(async (surgeryTypeId) => {
                const surgeryType = await SurgeryType.findByPk(surgeryTypeId);
                if (!surgeryType) {
                    throw new Error("Surgery Type not found");
                }
            }),
        body("date").notEmpty().isDate(),
        body("surgeryPrice").notEmpty().isFloat(),
        body('pricings.*.employeeId')
            .notEmpty()
            .isInt()
            .custom(async (employeeId) => {
                const employee = await Employee.findByPk(employeeId);
                if (!employee) {
                    throw new Error('Employee not found');
                }
            }),
        body('pricings.*.currencyId')
            .notEmpty()
            .isInt()
            .isInt({min: 0, max: 1}),
        body('pricings.*.fee')
            .notEmpty()
            .isFloat(),
        body('pricings.*.feeTypeId')
            .notEmpty()
            .isInt({min: 0, max: 1}),
    ];
};

const surgeryCaseUpdateValidationRules = () => {
    return [
        body("patientId")
            .optional()
            .isInt()
            .custom(async (patientId) => {
                if (patientId) {
                    const patient = await Patient.findByPk(patientId);
                    if (!patient) {
                        throw new Error("Patient not found");
                    }
                }
            }),
        body("surgeryTypeId")
            .optional()
            .isInt()
            .custom(async (surgeryTypeId) => {
                if (surgeryTypeId) {
                    const surgeryType = await SurgeryType.findByPk(surgeryTypeId);
                    if (!surgeryType) {
                        throw new Error("Surgery Type not found");
                    }
                }
            }),
        body("date").optional().isDate(),
        body("surgeryPrice").optional().isFloat(),
        surgeryCaseIdValidation,
    ];
};

const surgeryCaseDeletionValidationRules = () => {
    return [surgeryCaseIdValidation];
};

const surgeryCaseIdValidation = param("surgeryCaseId")
    .notEmpty()
    .isInt()
    .custom(async (surgeryCaseId) => {
        const surgeryCase = await SurgeryCase.findByPk(surgeryCaseId);
        if (!surgeryCase) {
            throw new Error("Surgery Case not found");
        }
    })
    .bail();

module.exports = {
    surgeryCaseCreationValidationRules,
    surgeryCaseUpdateValidationRules,
    surgeryCaseDeletionValidationRules,
    surgeryCaseIdValidation,
};