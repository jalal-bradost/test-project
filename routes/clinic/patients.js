const router = require("../../config/express");
const {body, param} = require("express-validator");
const {
    Patient, ICUData, SWData, OPData, ICUOperationType, SWOperationType, OPOperationType,
    PatientPayment, PICUData, PICUOperationType, SurgeryCase, SurgeryPricing, SurgeryType, PicuCase, PicuCaseItem,
    PicuCaseService, PicuCaseTime, PerfusionCase, PerfusionCaseItem, AnesthesiaCaseItem, ScrubNurseCase,
    ScrubNurseCaseItem, AnesthesiaCase
} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");
const {Op} = require("sequelize");

router.post("/clinic/patient",
    body("fullname").notEmpty(),
    body("birthdate").isISO8601().toDate(),
    body("sex").isInt(),
    body("bloodType").isInt(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const patientData = req.body;
        try {
            const newPatient = await Patient.create(patientData);
            return res.json(newPatient);
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
        }
    }
);

router.put("/clinic/patient/:patientId",
    param("patientId").isInt(),
    body("fullname").notEmpty(),
    body("birthdate").isISO8601().toDate(),
    body("sex").isInt(),
    body("bloodType").isInt(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {patientId} = req.params;
        const patientData = req.body;
        try {
            const patient = await Patient.findByPk(patientId);
            if (!patient) {
                return res.status(400).json({message: "بوونی نییە"});
            }
            await patient.update(patientData);
            return res.json(patient);
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
        }
    }
);

router.get("/clinic/patient/:patientId",
    param("patientId").isInt(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {patientId} = req.params;
        try {
            const patient = await Patient.findByPk(patientId);
            if (!patient) {
                return res.status(400).json({message: "بوونی نییە"});
            }
            return res.json(patient);
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
        }
    }
);

router.get("/clinic/patient/:patientId/data",
    param("patientId").isInt(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {patientId} = req.params;
        try {
            const patient = await Patient.findByPk(patientId, {include: [{model: ICUData}, {model: SWData}, {model: OPData}, {model: PICUData}]});
            if (!patient) {
                return res.status(400).json({message: "بوونی نییە"});
            }
            return res.json(patient);
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
        }
    }
);

router.get("/clinic/patients", async (req, res) => {
    try {
        const patients = await Patient.findAll();
        return res.json(patients.sort((a, b) => (a.patientId < b.patientId ? 1 : -1)));
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/clinic/child-patients", async (req, res) => {
    try {
        const patients = await Patient.findAll({
            include: [
                {model: ICUData, include: [{model: ICUOperationType}, {model: PatientPayment}]},
                {model: SWData, include: [{model: SWOperationType}, {model: PatientPayment}]},
                {model: OPData, include: [{model: OPOperationType}, {model: PatientPayment}]},
                {model: PICUData, include: [{model: PICUOperationType}]}
            ]
        });
        const filteredPatients = patients.map(patient => {
            const filteredPatient = patient.get({plain: true});
            if (filteredPatient.ICUData) {
                filteredPatient.ICUData = filteredPatient.ICUData.map((data) => ({...data, items: []}));
            }
            if (filteredPatient.PICUData) {
                filteredPatient.PICUData = filteredPatient.PICUData.map((data) => ({...data, items: []}));
            }
            if (filteredPatient.SWData) {
                filteredPatient.SWData = filteredPatient.SWData.map((data) => ({...data, items: []}));
            }
            if (filteredPatient.OPData) {
                filteredPatient.OPData = filteredPatient.OPData.map((data) => ({
                    ...data,
                    anesthesiaItems: [],
                    perfusionItems: [],
                    scrubNurseItems: []
                }));
            }
            return filteredPatient;
        });
        return res.json(filteredPatients.sort((a, b) => (a.patientId < b.patientId ? -1 : 1)));
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/clinic/picu-patients", async (req, res) => {
    try {
        const patients = await Patient.findAll({
            include: [
                {
                    model: PicuCase,
                    as: "picuCases",
                    include: [
                        {
                            model: PicuCaseItem, as: "items"
                        },
                        {
                            model: PicuCaseService,
                            as: "services"
                        },
                        {
                            model: PicuCaseTime,
                            as: "times"
                        }]
                }
            ]
        });
        return res.json(patients.sort((a, b) => (a.patientId < b.patientId ? -1 : 1)));
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/clinic/patients/data", async (req, res) => {
    try {
        const patients = await Patient.findAll({
            include: [
                {
                    model: ICUData,
                    include: [{model: PatientPayment}],
                    attributes: {exclude: ['items']}
                },
                {
                    model: SWData,
                    include: [{model: PatientPayment}],
                    attributes: {exclude: ['items']}
                },
                {
                    model: OPData,
                    include: [{model: OPOperationType}, {model: PatientPayment}],
                    attributes: {exclude: ['items']}
                },
                {
                    model: PICUData,
                    include: [{model: PICUOperationType}],
                    attributes: {exclude: ['scrubNurseItems', 'perfusionItems', 'anesthesiaItems']}
                },
                {
                    model: SurgeryCase,
                    as: "surgeryCases",
                    include: [
                        {
                            model: SurgeryPricing,
                            as: "pricings"
                        },
                        {
                            model: PatientPayment,
                            as: "patientPayment"
                        },
                        {
                            model: SurgeryType,
                            as: "surgeryType"
                        }
                    ]
                },
                {
                    model: PerfusionCase,
                    as: "perfusionCases",
                    // include: [
                    //     {model: PerfusionCaseItem, as: "items"}
                    // ]
                },
                {
                    model: AnesthesiaCase,
                    as: "anesthesiaCases",
                    // include: [
                    //     {model: AnesthesiaCaseItem, as: "items"}
                    // ]
                },
                {
                    model: ScrubNurseCase,
                    as: "scrubNurseCases",
                    // include: [
                    //     {model: ScrubNurseCaseItem, as: "items"}
                    // ]
                }
            ]
        });
        // const filteredPatients = patients.map(patient => {
        //     const filteredPatient = patient.get({plain: true});
        //     if (filteredPatient.ICUData) {
        //         filteredPatient.ICUData = filteredPatient.ICUData.map((data) => ({...data, items: []}));
        //     }
        //     if (filteredPatient.PICUData) {
        //         filteredPatient.PICUData = filteredPatient.PICUData.map((data) => ({...data, items: []}));
        //     }
        //     if (filteredPatient.SWData) {
        //         filteredPatient.SWData = filteredPatient.SWData.map((data) => ({...data, items: []}));
        //     }
        //     if (filteredPatient.OPData) {
        //         filteredPatient.OPData = filteredPatient.OPData.map((data) => ({
        //             ...data,
        //             anesthesiaItems: [],
        //             perfusionItems: [],
        //             scrubNurseItems: []
        //         }));
        //     }
        //     return filteredPatient;
        // });
        return res.json(patients.sort((a, b) => (a.patientId < b.patientId ? -1 : 1)));
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.delete("/clinic/patient/:patientId",
    param("patientId").isInt(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {patientId} = req.params;
        try {
            const patient = await Patient.findByPk(patientId);
            if (!patient) {
                return res.status(400).json({message: "بوونی نییە"});
            }
            // await patient.destroy();
            return res.json({message: "نەخۆش سڕایەوە بە سەرکەوتوویی"});
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
        }
    }
);

module.exports = router;
