const {body, param, query} = require('express-validator');
const {
    PatientPayment,
    Patient,
    ICUData,
    SWData,
    SurgeryCase,
    OPData,
    PerfusionCase,
    ScrubNurseCase,
    AnesthesiaCase
} = require("../../models");

const patientPaymentCreationValidationRules = () => {
    return [
        body('patientId')
            .notEmpty()
            .isInt()
            .custom(async (patientId) => {
                const patient = await Patient.findByPk(patientId);
                if (!patient) {
                    throw new Error('Patient not found');
                }
            }),
        body('insurance')
            .notEmpty()
            .isFloat(),
        body('icuId')
            .optional()
            .isInt()
            .custom(async (icuId) => {
                if (icuId) {
                    const icu = await ICUData.findByPk(icuId);
                    if (!icu) {
                        throw new Error('ICUData not found');
                    }
                }
            }),
        body('swId')
            .optional()
            .isInt()
            .custom(async (swId) => {
                if (swId) {
                    const surgeryWard = await SWData.findByPk(swId);
                    if (!surgeryWard) {
                        throw new Error('Surgery Ward not found');
                    }
                }
            }),
        body('opId')
            .optional()
            .isInt()
            .custom(async (opId) => {
                if (opId) {
                    const operationRoom = await OPData.findByPk(opId);
                    if (!operationRoom) {
                        throw new Error('Operation Room not found');
                    }
                }
            }),
        body('surgeryCaseId')
            .optional()
            .isInt()
            .custom(async (surgeryCaseId) => {
                if (surgeryCaseId) {
                    const surgeryCase = await SurgeryCase.findByPk(surgeryCaseId);
                    if (!surgeryCase) {
                        throw new Error('Surgery Case not found');
                    }
                }
            }),
        // body('perfusionCaseId')
        //     .optional()
        //     .isInt()
        //     .custom(async (perfusionCaseId) => {
        //         if (perfusionCaseId) {
        //             const perfusionCase = await PerfusionCase.findByPk(perfusionCaseId);
        //             if (!perfusionCase) {
        //                 throw new Error('Perfusion Case not found');
        //             }
        //         }
        //     }),
        // body('anesthesiaCaseId')
        //     .optional()
        //     .isInt()
        //     .custom(async (anesthesiaCaseId) => {
        //         if (anesthesiaCaseId) {
        //             const anesthesiaCase = await AnesthesiaCase.findByPk(anesthesiaCaseId);
        //             if (!anesthesiaCase) {
        //                 throw new Error('Anesthesia Case not found');
        //             }
        //         }
        //     }),
        // body('scrubNurseCaseId')
        //     .optional()
        //     .isInt()
        //     .custom(async (scrubNurseCaseId) => {
        //         if (scrubNurseCaseId) {
        //             const scrubNurseCase = await ScrubNurseCase.findByPk(scrubNurseCaseId);
        //             if (!scrubNurseCase) {
        //                 throw new Error('Scrub Nurse Case not found');
        //             }
        //         }
        //     }),
        body('swRoomNumber')
            .optional()
            .isString(),
        body('totalPaidIQD')
            .notEmpty()
            .isInt(),
        body('totalPaidUSD')
            .notEmpty()
            .isInt(),
        body('note')
            .optional()
            .isString()
    ];
};

const patientPaymentUpdateValidationRules = () => {
    return [
        patientPaymentCreationValidationRules(),
        patientPaymentIdValidation
    ];
};

const patientPaymentInsuranceUpdateValidationRules = () => {
    return [
        body('insurance')
            .notEmpty()
            .isFloat(),
        patientPaymentIdValidation
    ];
};

const fromToDateValidationRules = () => {
    return [
        query('from')
            .optional({values: "falsy"})
            .toDate(),
        query('to')
            .optional({values: "falsy"})
            .toDate()
    ];
};

const patientPaymentDeletionValidationRules = () => {
    return [patientPaymentIdValidation];
};

const patientPaymentIdValidation = param('patientPaymentId')
    .notEmpty()
    .isInt()
    .custom(async (patientPaymentId) => {
        const patientPayment = await PatientPayment.findByPk(patientPaymentId);
        if (!patientPayment) {
            throw new Error('Patient Payment not found');
        }
    })
    .bail();

module.exports = {
    patientPaymentCreationValidationRules,
    patientPaymentUpdateValidationRules,
    patientPaymentDeletionValidationRules,
    patientPaymentInsuranceUpdateValidationRules,
    patientPaymentIdValidation,
    fromToDateValidationRules
};