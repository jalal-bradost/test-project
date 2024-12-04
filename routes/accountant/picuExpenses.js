const router = require("../../config/express");
const {body, param} = require("express-validator");
const {
    ChildrenPatientPayment,
    Patient,
    sequelize,
    Safe,
    SafeLog, PICUSpecialty, PICULab, PICURadiology, PICUExpense,
    PICUExpenseConsultation, PICUExpenseTransport, PICUExpenseProcedure, PICUExpenseRadiology, PICUExpenseLab
} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");

router.post("/accountant/expenses/picu", requirePermissions(permissionMap.accountant), [
    body("childrenPatientPaymentId").isInt().custom(async value => {
        const payment = ChildrenPatientPayment.findByPk(value)
        if (!payment) throw new Error("Patient payment not found with id of " + value)
    }).bail(),
    body("consultations.*.picuSpecialtyId").isInt().custom(async value => {
        const specialty = PICUSpecialty.findByPk(value)
        if (!specialty) throw new Error("Specialty not found with id of " + value)
    }).bail(),
    body("consultations.*.consultantName").isString().bail(),
    body("consultations.*.amountUSD").isNumeric().bail(),
    body("consultations.*.amountIQD").isNumeric().bail(),
    body("consultations.*.paid").isBoolean().bail(),
    body("lab.*.picuLabId").isInt().custom(async value => {
        const lab = PICULab.findByPk(value)
        if (!lab) throw new Error("Lab not found with id of " + value)
    }).bail(),
    body("lab.*.amountUSD").isNumeric().bail(),
    body("lab.*.amountIQD").isNumeric().bail(),
    body("lab.*.paid").isBoolean().bail(),
    body("radiology.*.picuRadiologyId").isInt().custom(async value => {
        const radiology = PICURadiology.findByPk(value)
        if (!radiology) throw new Error("Radiology not found with id of " + value)
    }).bail(),
    body("radiology.*.amountUSD").isNumeric().bail(),
    body("radiology.*.amountIQD").isNumeric().bail(),
    body("radiology.*.paid").isBoolean().bail(),
    body("procedures.*.name").isInt().isString().bail(),
    body("procedures.*.amountUSD").isNumeric().bail(),
    body("procedures.*.amountIQD").isNumeric().bail(),
    body("procedures.*.paid").isBoolean().bail(),
    body("transports.*.name").isInt().isString().bail(),
    body("transports.*.amountUSD").isNumeric().bail(),
    body("transports.*.amountIQD").isNumeric().bail(),
    body("transports.*.paid").isBoolean().bail(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        await sequelize.transaction(async t => {
            const {
                childrenPatientPaymentId,
                consultations,
                lab,
                radiology,
                procedures,
                transports
            } = req.body;
            const expense = await PICUExpense.create({childrenPatientPaymentId}, {transaction: t})
            let totalUSD = 0;
            let totalIQD = 0;
            for (const consultation of consultations) {
                await PICUExpenseConsultation.create({
                    picuExpenseId: expense.picuExpenseId,
                    picuSpecialtyId: consultation.picuSpecialtyId,
                    consultantName: consultation.consultantName,
                    amountUSD: consultation.amountUSD,
                    amountIQD: consultation.amountIQD,
                    paid: consultation.paid
                }, {transaction: t})
                totalUSD += parseFloat(consultation.amountUSD);
                totalIQD += parseInt(consultation.amountIQD);
            }
            for (const labItem of lab) {
                await PICUExpenseLab.create({
                    picuExpenseId: expense.picuExpenseId,
                    picuLabId: labItem.picuLabId,
                    amountUSD: labItem.amountUSD,
                    amountIQD: labItem.amountIQD,
                    paid: labItem.paid
                }, {transaction: t})
                totalUSD += parseFloat(labItem.amountUSD);
                totalIQD += parseInt(labItem.amountIQD);
            }
            for (const radiologyItem of radiology) {
                await PICUExpenseRadiology.create({
                    picuExpenseId: expense.picuExpenseId,
                    picuRadiologyId: radiologyItem.picuRadiologyId,
                    amountUSD: radiologyItem.amountUSD,
                    amountIQD: radiologyItem.amountIQD,
                    paid: radiologyItem.paid
                }, {transaction: t})
                totalUSD += parseFloat(radiologyItem.amountUSD);
                totalIQD += parseInt(radiologyItem.amountIQD);
            }
            for (const procedure of procedures) {
                await PICUExpenseProcedure.create({
                    picuExpenseId: expense.picuExpenseId,
                    name: procedure.name,
                    amountUSD: procedure.amountUSD,
                    amountIQD: procedure.amountIQD,
                    paid: procedure.paid
                }, {transaction: t})
                totalUSD += parseFloat(procedure.amountUSD);
                totalIQD += parseInt(procedure.amountIQD);
            }
            for (const transport of transports) {
                await PICUExpenseTransport.create({
                    picuExpenseId: expense.picuExpenseId,
                    name: transport.name,
                    amountUSD: transport.amountUSD,
                    amountIQD: transport.amountIQD,
                    paid: transport.paid
                }, {transaction: t})
                totalUSD += parseFloat(transport.amountUSD);
                totalIQD += parseInt(transport.amountIQD);
            }
            const safe = await Safe.findOne({
                where: {
                    name: "PICU"
                }, transaction: t
            });
            if (!safe) {
                throw new Error(`Safe with name 'PICU' not found`);
            }
            safe.balanceUSD -= totalUSD;
            safe.balanceIQD -= totalIQD;
            await safe.save({transaction: t});
            await SafeLog.create({
                safeId: safe.safeId,
                amountUSD: -totalUSD,
                amountIQD: -totalIQD,
                description: "PICUExpenseId=" + expense.picuExpenseId
            }, {transaction: t});
            return res.json({message: "success"});
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/accountant/expenses/picu", requirePermissions(permissionMap.accountant), async (req, res) => {
    try {
        const expenses = await PICUExpense.findAll({
            include: [
                {
                    model: PICUExpenseConsultation,
                    include: [{model: PICUSpecialty}]
                },
                {model: PICUExpenseLab, include: [{model: PICULab}]},
                {
                    model: PICUExpenseRadiology,
                    include: [{model: PICURadiology}]
                },
                {model: PICUExpenseProcedure},
                {model: PICUExpenseTransport},
                {model: ChildrenPatientPayment, include: [{model: Patient}]},
            ]
        });
        return res.json(expenses);
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.post("/accountant/expenses/picu/specialties", requirePermissions(permissionMap.accountant), [body("name").isString()], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const {name} = req.body;
        const specialty = await PICUSpecialty.create({name});
        return res.json(specialty);
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/accountant/expenses/picu/specialties", requirePermissions(permissionMap.accountant), async (req, res) => {
    try {
        const specialties = await PICUSpecialty.findAll();
        return res.json(specialties);
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.post("/accountant/expenses/picu/radiology", requirePermissions(permissionMap.accountant), [body("name").isString()], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const {name} = req.body;
        const radiology = await PICURadiology.create({name});
        return res.json(radiology);
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/accountant/expenses/picu/radiology", requirePermissions(permissionMap.accountant), async (req, res) => {
    try {
        const radiology = await PICURadiology.findAll();
        return res.json(radiology);
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.post("/accountant/expenses/picu/labs", requirePermissions(permissionMap.accountant), [body("name").isString()], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const {name} = req.body;
        const lab = await PICULab.create({name});
        return res.json(lab);
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/accountant/expenses/picu/labs", requirePermissions(permissionMap.accountant), async (req, res) => {
    try {
        const labs = await PICULab.findAll();
        return res.json(labs);
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

module.exports = router;