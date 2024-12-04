const router = require("../../config/express");
const {body} = require("express-validator");
const {Buy, BuyDebt, Retailer} = require("../../models");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
const systemCategoryId = 1;
router.post("/warehouse/buy-debt", requirePermissions([permissionMap.buyProduct]), body("debtId").isInt(), body("paidAmount").isFloat(), async (req, res) => {
    const {debtId, paidAmount} = req.body
    try {
        const buyDebt = await BuyDebt.findByPk(debtId, {
            include: [{
                model: Buy
            }]
        })
        if (!buyDebt) {
            return res.status(404).json({message: "ئەم کڕینە نەدۆزرایەوە"})
        }
        if (buyDebt.Buy.totalPrice < paidAmount) {
            return res.status(400).json({message: "بڕی قەردی دراوە نابێت زیاتر بێت لە بڕی کڕین"})
        }
        buyDebt.paidAmount = paidAmount
        await buyDebt.save()
        return res.json({message: "درانەوەی قەرد سەرکەوتووبوو"});
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک لە سێرڤەر ڕوویدا"})
    }
});

router.get("/warehouse/buy-debts", requirePermissions([permissionMap.buyProduct]), async (req, res) => {
    try {
        const buyDebts = await BuyDebt.findAll({
            include: [{
                model: Buy, where: {
                    systemCategoryId
                }, include: [{model: Retailer}]
            }]
        })
        return res.json(buyDebts.sort((a, b) => (new Date(a.Buy.date).getTime() < new Date(b.Buy.date).getTime() ? 1 : -1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک لە سێرڤەر ڕوویدا"})
    }
});
