const router = require("../../config/express");
const {body, param} = require("express-validator");
const {
    ChildrenPatientPayment,
    Patient,
    sequelize,
    Safe,
    SafeLog, ICUData, OPData, SWData, PICUData
} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");

// The new cost fields from the refactored model
const costFields = [
    "obcCost",
    "l1Cost",
    "l2Cost",
    "nivCost",
    "ivCost",
    "clCost",
    "tpnCost",
    "coolingCost",
    "inoCost",
    "consultationCost",
    "surgeryCost",
    "usCost",
    "xrCost",
    "investigationCost",
    "milkCost",
    "mafCost",
    "consumablesCost",
    "transportCost",
    "uacCost",
    "uvcCost",
    "fclCost",
    "intubationCost",
    "piccLineCost",
    "chestTubeCost",
    "lpCost",
    "consultantVisitCost",
    "otherCosts",
];

router.post("/accountant/children-patient-payment", requirePermissions(permissionMap.accountant), [
    body("patientId").isNumeric().custom(async patientId => {
        const patient = await Patient.findByPk(patientId);
        if (!patient) {
            return Promise.reject("نەخۆش نەدۆزرایەوە");
        }
    }),
    ...costFields.map(field => body(field).isNumeric()), // Updated cost validation
    body("insurance").isNumeric(),
    body("insuranceReturn").isNumeric(),
    body("totalPaidUSD").isNumeric(),
    body("totalPaidIQD").isNumeric(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const childrenPatientPayment = await ChildrenPatientPayment.create(req.body, {transaction: t});
            // let profit = calculateProfit(childrenPatientPayment);
            const {totalPaidIQD, totalPaidUSD} = req.body;
            await distributeProfit(totalPaidUSD, totalPaidIQD, childrenPatientPayment, t);
            return res.json({message: "بەسەرکەوتوویی زیاد کرا"});
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

const calculateProfit = (childrenPatientPayment) => {
    let totalCostOfItems = costFields.reduce(
        (sum, fieldName) => sum + (childrenPatientPayment[fieldName] || 0),
        0
    );
    let totalReceived = childrenPatientPayment.cost + childrenPatientPayment.insurance - childrenPatientPayment.insuranceReturn;
    return totalReceived - totalCostOfItems;
};

// const picuSafeId = 6;
const distributeProfit = async (totalUSD, totalIQD, childrenPatientPayment, t) => {
    const picuSafe = await Safe.findOne({
                                         where: {
                                             name: "PICU",
                                         }, transaction: t
                                     });
    if (!picuSafe) {
        throw new Error(`Safe with name 'PICU' not found`);
    }
    picuSafe.balanceUSD += parseFloat(totalUSD);
    picuSafe.balanceIQD += parseInt(totalIQD);
    await picuSafe.save({transaction: t});
    await SafeLog.create({
                             safeId: picuSafe.safeId,
                             amountUSD: totalUSD,
                             amountIQD: totalIQD,
                             description: "childrenPatientPaymentId=" + childrenPatientPayment.childrenPatientPaymentId
                         }, {transaction: t});

}

router.get("/accountant/children-patient-payments", requirePermissions(permissionMap.accountant), async (req, res) => {
    try {
        const childrenPatientPayments = await ChildrenPatientPayment.findAll({
                                                                                 include: [
                                                                                     {model: Patient},
                                                                                     {model: PICUData},
                                                                                     {model: OPData},
                                                                                     {model: SWData}
                                                                                 ]
                                                                             });
        return res.json(childrenPatientPayments);
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
})

router.delete("/accountant/children-patient-payment/:childrenPatientPaymentId",
              requirePermissions(permissionMap.accountant),
              [
                  param("childrenPatientPaymentId").isInt(),
              ],
              returnInCaseOfInvalidation,
              async (req, res) => {
                  const {childrenPatientPaymentId} = req.params;
                  try {
                      await sequelize.transaction(async (t) => {
                          await ChildrenPatientPayment.destroy({where: {childrenPatientPaymentId}, transaction: t});
                          const safeLogs = await SafeLog.findAll({
                                                                     where: {description: "childrenPatientPaymentId=" + childrenPatientPaymentId},
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