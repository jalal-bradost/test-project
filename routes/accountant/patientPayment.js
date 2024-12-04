const router = require("../../config/express");
const {
    body,
    param
} = require("express-validator");
const {PatientPayment, Patient, sequelize, ICUData, SWData, OPData, NetWorth, Safe, SafeLog} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");

router.post("/accountant/patient-payment", requirePermissions(permissionMap.accountant), [
    body("patientId").isNumeric().custom(async patientId => {
        const patient = await Patient.findByPk(patientId);
        if (!patient) {
            return Promise.reject("نەخۆش نەدۆزرایەوە");
        }
    }),
    body("cost").isNumeric(),
    body("swRoomCharge").isNumeric(),
    body("radiology").isNumeric(),
    body("laboratory").isNumeric(),
    body("echo").isNumeric(),
    body("consultation").isNumeric(),
    body("physioTherapy").isNumeric(),
    body("dialysis").isNumeric(),
    body("icuRoomCharge").isNumeric(),
    body("insurance").isNumeric(),
    body("otherCosts").isNumeric(),
    body("insuranceReturn").isNumeric(),
    body("icuId").optional().isInt(),
    body("swId").optional().isInt(),
    body("opId").optional().isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const patientPayment = await PatientPayment.create(req.body,
                                                               {transaction: t, include: [ICUData, SWData, OPData]});
            // let profit = calculateProfit(patientPayment);
            const totalReceived= patientPayment.cost + patientPayment.insurance - patientPayment.insuranceReturn;
            await distributeProfit(totalReceived, patientPayment, t);
            return res.json({message: "بەسەرکەوتوویی زیاد کرا"})
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
})


const distributeProfit = async (profit, patientPayment, t) => {
    const safes = await Safe.findAll({transaction: t});
    if (profit <= 0) {
        console.log("Profit is zero for ", patientPayment)
        return;
    }
    for (const safe of safes) {
        const safeProfit = profit * safe.percentage;
        safe.balanceUSD += safeProfit;
        await safe.save({transaction: t});
        await SafeLog.create({
                                 safeId: safe.safeId,
                                 amountUSD: safeProfit,
                                 description: "patientPaymentId=" + patientPayment.patientPaymentId
                             }, {transaction: t});
        profit -= safeProfit;
    }
    if (profit > 0) {
        await Safe.increment({balanceUSD: profit}, {where: {safeId: 1}, transaction: t});
        await SafeLog.create({
                                 safeId: 1,
                                 amountUSD: profit,
                                 description: "patientPaymentId=" + patientPayment.patientPaymentId
                             }, {transaction: t});
    }
}
router.get("/accountant/patient-payments", requirePermissions(permissionMap.accountant), async (req, res) => {
    try {
        const patientPayments = await PatientPayment.findAll({
                                                                 include: [
                                                                     {model: Patient},
                                                                     {model: ICUData},
                                                                     {model: OPData},
                                                                     {model: SWData}
                                                                 ]
                                                             });
        return res.json(patientPayments);
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
})

router.delete("/accountant/patient-payment/:patientPaymentId", requirePermissions(permissionMap.accountant), [
    param("patientPaymentId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    const {patientPaymentId} = req.params;
    try {
        await sequelize.transaction(async (t) => {
            await PatientPayment.destroy({where: {patientPaymentId}, transaction: t});
            const safeLogs = await SafeLog.findAll({
                                                       where: {description: "patientPaymentId=" + patientPaymentId},
                                                       transaction: t
                                                   });
            for (const safeLog of safeLogs) {
                const safe = await Safe.findByPk(safeLog.safeId, {transaction: t});
                safe.balanceUSD -= safeLog.amountUSD;
                safe.balanceIQD -= safeLog.amountIQD;
                await safe.save({transaction: t});
                await safeLog.destroy({transaction: t});
            }
        })
        return res.json({message: "سڕایەوە"});
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
})
