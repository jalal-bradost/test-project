const router = require('../config/express')
const requireRoles = require("../middlware/requirePermissions")
const isAuthenticated = require("../middlware/isAuthenticatedMiddleware")
const {body} = require("express-validator");
const db = require("../models/index");
router.post("/settings", requireRoles([0]), body("key").notEmpty(), body("value").notEmpty(), async (req, res) => {
    const {key, value} = req.body
    try {
        const setting = await db.Settings.upsert({value, key}, {where: {key}})
        return res.json(setting[0])
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});

router.delete("/settings/:key", requireRoles([0]), async (req, res) => {
    const {key} = req.params
    try {
        const setting = await db.Settings.findByPk(key)
        if (!setting) {
            return res.status(404).json({message: "نەدۆزرایەوە"})
        }
        await setting.destroy()
        return res.json({message: "سڕایەوە بە سەرکەوتوویی"})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});

router.get("/settings", requireRoles([0]), async (req, res) => {
    try {
        const settings = await db.Settings.findAll()
        const settingsObject = {}
        for (const setting of settings) {
            settingsObject[setting.key] = setting.value
        }
        return res.json(settingsObject)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});

router.get("/settings/:key", requireRoles([0]), async (req, res) => {
    const {key} = req.params
    try {
        const setting = await db.Settings.findByPk(key)
        if (!setting) {
            return res.json({key, value: null})
        }
        return res.json(setting)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});

module.exports = router;