require('dotenv').config()
const {initializeDB} = require("./lib/db")
const {
    OPData,
    PerfusionCase,
    PerfusionCaseItem,
    AnesthesiaCaseItem,
    ScrubNurseCaseItem,
    ScrubNurseCase,
    AnesthesiaCase,
    sequelize, Patient, ICUData, ICUOperationType, PatientPayment, SWData, SWOperationType, OPOperationType,
    PICUOperationType, PICUData, SurgeryCase, SurgeryPricing, SurgeryType
} = require("./models");
const fs = require("fs");
initializeDB().then(async () => {
        console.log("Database initialized")
        const time = Date.now();
        const patients = await Patient.findAll({
            include: [
                {
                    model: ICUData,
                    include: [{model: ICUOperationType}, {model: PatientPayment}],
                    attributes: {exclude: ['items']}
                },
                {
                    model: SWData,
                    include: [{model: SWOperationType}, {model: PatientPayment}],
                    attributes: {exclude: ['items']}
                },
                {
                    model: OPData,
                    include: [{model: OPOperationType}, {model: PatientPayment}],
                    attributes: {exclude: ['scrubNurseItems', 'perfusionItems', 'anesthesiaItems']}
                },
                {
                    model: PICUData,
                    include: [{model: PICUOperationType}],
                    attributes: {exclude: ['items']}
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
                    include: [
                        {model: PerfusionCaseItem, as: "items"}
                    ]
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
                    include: [
                        {model: ScrubNurseCaseItem, as: "items"}
                    ]
                }
            ]
        });
        console.log("Time taken: ", Date.now() - time, "ms")
        fs.writeFileSync("patients.json", JSON.stringify(patients.map(x => x.get({plain: true})), null, 2))
    }
).catch((e) => {
    console.log(e)
    process.exit(1);
});

