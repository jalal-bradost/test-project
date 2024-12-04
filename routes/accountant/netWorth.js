const router = require("../../config/express");
const {
    body,
    param
} = require("express-validator");
const {NetWorth} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");

async function addNetWorth(amount, description, userId) {
    if (!amount || !userId) return null;
    try {
        return await NetWorth.create({
            amount,
            description,
            userId
        });
    } catch (e) {
        console.log(e);
        return null;
    }
}

router.post("/accountant/net-worth", requirePermissions([permissionMap.accountant]), body("amount").isFloat(), async (req, res) => {
    const {
        amount,
        description
    } = req.body;
    const userId = req.user.userId;
    const netWorth = await addNetWorth(amount, description, userId);
    if (!netWorth) return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    return res.status(201).json({message: "بەسەرکەوتوویی جێبەجێکرا"});
})
router.get("/accountant/net-worth", requirePermissions([permissionMap.accountant]), async (req, res) => {
    const netWorth = await NetWorth.findAll();
    if (!netWorth) return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    return res.status(200).json(netWorth.sort((a, b) => b.netWorthId - a.netWorthId));
})

router.put("/accountant/net-worth/:netWorthId", requirePermissions([permissionMap.accountant]), param("netWorthId").isInt(), body("amount").isFloat(), returnInCaseOfInvalidation, async (req, res) => {
    const {netWorthId} = req.params;
    const {
        amount,
        description
    } = req.body;
    const netWorth = await NetWorth.findByPk(netWorthId);
    if (!netWorth) return res.status(404).json({message: "نەدۆزرایەوە"});
    netWorth.amount = amount;
    netWorth.description = description;
    await netWorth.save();
    return res.status(200).json({message: "بەسەرکەوتوویی گۆڕدرا"});
});

router.delete("/accountant/net-worth/:netWorthId", requirePermissions([permissionMap.accountant]), param("netWorthId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {netWorthId} = req.params;
    const netWorth = await NetWorth.findByPk(netWorthId);
    if (!netWorth) return res.status(404).json({message: "نەدۆزرایەوە"});
    await netWorth.destroy();
    return res.status(200).json({message: "بەسەرکەوتووی سڕدرایەوە"});
});