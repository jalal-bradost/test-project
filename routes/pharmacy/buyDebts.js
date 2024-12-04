const router = require("../../config/express");
const {body, param} = require("express-validator");
const {Buy, BuyDebt, Retailer, sequelize} = require("../../models");
const {systemCategoryId, systemPermission} = require("./pharmacyConstants");
const requirePermissions = require("../../middlware/requirePermissions");

router.post("/pharmacy/buy-debt", requirePermissions(systemPermission), body("buyId").isInt(), async (req, res) => {
    const {buyId} = req.body
    const transaction = await sequelize.transaction()
    try {
        const buy = await Buy.findOne({where: {buyId, systemCategoryId}});
        if (!buy) {
            return res.status(404).json({message: "Buy not found."})
        }
        if (buy.paymentType === "debt") {
            return res.status(400).json({message: "Debt is already created."})
        }
        const buyDebt = await BuyDebt.create({systemCategoryId, transaction, buyId, paidAmount: 0})
        await Buy.update({paymentType: "debt"}, {where: {buyId}, transaction})
        await transaction.commit()
        return res.json(buyDebt)
    } catch (e) {
        console.error(e)
        return res.status(500).json({message: "Internal server error"})
    }
});
router.put("/pharmacy/buy-debt", requirePermissions(systemPermission), body("debtId").isInt(), body("paidAmount").isFloat(), async (req, res) => {
    const {debtId, paidAmount} = req.body
    try {
        const buyDebt = await BuyDebt.findOne({where: {debtId}, include: [{model: Buy}]})
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

router.get("/pharmacy/buy-debts", requirePermissions(systemPermission), async (req, res) => {
    try {
        const buyDebts = await BuyDebt.findAll({
            include: [{
                model: Buy, where: {systemCategoryId}, include: [{model: Retailer}]
            }]
        })
        return res.json(buyDebts.sort((a, b) => (a.debtId < b.debtId ? 1 : -1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک لە سێرڤەر ڕوویدا"})
    }
});

router.delete("/pharmacy/buy-debt/:debtId", requirePermissions(systemPermission), param("debtId").isInt(), async (req, res) => {
    const debtId = req.params.debtId
    const transaction = await sequelize.transaction()
    try {
        const buyDebt = await BuyDebt.findOne({where: {debtId}});
        if (!buyDebt) {
            return res.status(404).json({message: "Debt not found."})
        }
        if (buyDebt.paidAmount > 0) {
            return res.status(400).json({message: "Debt cannot be deleted."})
        }
        await Buy.update({paymentType: "upfront"}, {where: {buyId: buyDebt.buyId}, transaction})
        await buyDebt.destroy({transaction})
        await transaction.commit()
        return res.json({message: "Debt deleted successfully."})
    } catch (e) {
        console.log(e)
        await transaction.rollback()
        return res.status(500).json({message: "هەڵەیەک لە سێرڤەر ڕوویدا"})
    }
});
