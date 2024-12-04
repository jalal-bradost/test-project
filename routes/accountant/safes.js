const router = require("../../config/express")
const {body, validationResult, param} = require("express-validator")
const {Safe, SafeLog} = require("../../models")
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation")
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
router.post("/accountant/safe",
    requirePermissions([permissionMap.accountant]),
    [body("name").isString(), body("percentage").isFloat({min: 0, max: 1})],
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {name, percentage} = req.body
        try {
            const safe = await Safe.create({name, percentage})
            return res.json(safe)
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    })
router.put("/accountant/safe",
    requirePermissions([permissionMap.accountant]),
    [
        body("safeId").isInt().custom(async safeId => {
            const safe = await Safe.findByPk(safeId)
            if (!safe) {
                throw new Error('Safe is not found')
            }
        }),
        body("name").notEmpty(),
        body("percentage").isFloat({min: 0, max: 1})
    ],
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {name, safeId, percentage} = req.body
        try {
            await Safe.update({name, percentage}, {where: {safeId}})
            return res.json({name, percentage, safeId})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    })

router.get("/accountant/safe/:safeId",
    requirePermissions([permissionMap.accountant]),
    param("safeId").isInt(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {safeId} = req.params
        try {
            const safe = await Safe.findByPk(safeId, {include: [{model: SafeLog, as: "logs"}]})
            if (!safe) {
                return res.status(400).json({message: "ئەو قاسەیە بوونی نییە"})
            }
            return res.json({...safe.get(), logs: safe.logs.sort((a, b) => (a.safeLogId > b.safeLogId ? -1 : 1))})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    })

router.delete("/accountant/safe/:safeId",
    requirePermissions([permissionMap.accountant]),
    param("safeId").isInt(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {safeId} = req.params
        try {
            const safe = await Safe.findByPk(safeId)
            if (!safe) {
                return res.status(400).json({message: "ئەو قاسەیە بوونی نییە"})
            }
            await safe.destroy()
            return res.json({message: "قاسە سڕایەوە بە سەرکەوتوویی"})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    })
router.get("/accountant/safes", requirePermissions([permissionMap.accountant]), async (req, res) => {
    try {
        const categories = await Safe.findAll()
        return res.json(categories.sort((a, b) => (a.percentage > b.percentage ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});

router.put("/accountant/safe/balance",
    requirePermissions([permissionMap.accountant]),
    [
        body("safeId").isInt().custom(async safeId => {
            const safe = await Safe.findByPk(safeId)
            if (!safe) {
                throw new Error('Safe is not found')
            }
        }),
        body("amountUSD").isFloat(),
        body("amountIQD").isInt(),
        // body("description").optional().isString()
    ],
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {safeId, amountUSD, amountIQD, description} = req.body
        try {
            const safe = await Safe.findByPk(safeId)
            if (!safe) {
                return res.status(400).json({message: "ئەو قاسەیە بوونی نییە"})
            }

            // Update the safe balance
            await safe.update({
                balanceUSD: safe.balanceUSD + amountUSD,
                balanceIQD: safe.balanceIQD + amountIQD
            })

            // Create a log entry for the transaction
            await SafeLog.create({
                safeId,
                amountUSD,
                amountIQD,
                description
            })

            return res.json({message: "باڵانسی قاسە نوێکرایەوە بە سەرکەوتوویی"})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    })
