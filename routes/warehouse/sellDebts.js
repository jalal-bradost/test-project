const router = require("../../config/express");
const {body} = require("express-validator");
const {Sell, SellDebt, Customer} = require("../../models");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");

router.post("/warehouse/sell-debt", requirePermissions([permissionMap.sellProduct]), body("debtId").isInt(), body("paidAmount").isFloat(), async (req, res) => {
    const {debtId, paidAmount} = req.body
    try {
        const sellDebt = await SellDebt.findByPk(debtId, {include: [{model: Sell}]})
        if (!sellDebt) {
            return res.status(404).json({message: "ئەم فرۆشتنە نەدۆزرایەوە"})
        }
        if (sellDebt.Sell.totalPrice < paidAmount) {
            return res.status(400).json({message: "بڕی قەردی دراوە نابێت زیاتر بێت لە بڕی فرۆشراو"})
        }
        sellDebt.paidAmount = paidAmount
        await sellDebt.save()
        return res.json({message: "درانەوەی قەرد سەرکەوتووبوو"});
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک لە سێرڤەر ڕوویدا"})
    }
});

router.get("/warehouse/sell-debts", requirePermissions([permissionMap.sellProduct]), async (req, res) => {
    try {
        const sellDebts = await SellDebt.findAll({include: [{model: Sell, include: [{model: Customer}]}]})
        return res.json(sellDebts)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک لە سێرڤەر ڕوویدا"})
    }
});
