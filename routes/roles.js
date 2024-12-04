const router = require('../config/express')
const requireRoles = require("../middlware/requirePermissions")
const isAuthenticated = require("../middlware/isAuthenticatedMiddleware")
const {body, param} = require("express-validator");
const db = require("../models/index");
const {Role, User} = require("../models");
const returnInCaseOfInvalidation = require("../middlware/returnInCaseOfInvalidation");

router.post("/role", requireRoles([0]), body("name").notEmpty(), body("permissions.*").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const role = req.body
    try {
        const dbRole = await Role.create(role)
        return res.json(dbRole)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});

router.delete("/role/:roleId", requireRoles([0]), param("roleId").isInt().custom(async roleId => {
    const role = await Role.findByPk(roleId, {include: [{model: User}]})
    if (!role) {
        throw new Error('ئەم ڕۆلە بوونی نییە')
    }
    if (role.Users.length > 0) {
        throw new Error('ناتوانیت ئەم ڕۆلە بسڕیتەوە')
    }

}), returnInCaseOfInvalidation, async (req, res) => {
    try {
        await Role.destroy({where: {roleId: req.params.roleId}})
        return res.json("ڕۆل بەسەرکەوتوویی سڕایەوە")
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});

router.put("/role/:roleId", requireRoles([0]), param("roleId").isInt().custom(async roleId => {
    const role = await Role.findByPk(roleId)
    if (!role) {
        throw new Error('ئەم ڕۆلە بوونی نییە')
    }

}), body("name").notEmpty(), body("permissions.*").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const role = req.body
    try {
        await Role.upsert(role, {where: {roleId: req.params.roleId}})
        return res.json("ڕۆل بەسەرکەوتوویی نوێکرایەوە")
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});

router.get("/roles", requireRoles([0]), async (req, res) => {
    try {
        const roles = await db.Role.findAll({include: [{model: User}]})
        return res.json(roles)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});

module.exports = router;