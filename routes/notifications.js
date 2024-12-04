const router = require('../config/express')
const requireRoles = require("../middlware/requirePermissions");
const {body} = require("express-validator");
const returnInCaseOfInvalidation = require("../middlware/returnInCaseOfInvalidation");
const {Notification} = require("../models");
const isAuthenticated = require("../middlware/isAuthenticatedMiddleware");
router.get("/notifications", isAuthenticated, async (req, res) => {
    try {
        // const user = req.user
        // const notifications = await Notification.findAll({where: {userId: user.userId}})
        // return res.json(notifications)
        return res.json([])
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});

router.post("/notification", isAuthenticated, requireRoles([0]),
    body("title").isString(),
    body("description").isString(),
    body("userId").isInt(),
    body("isRead").isBoolean(),
    body("href").isString(),
    body("type").isString(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        // try {
        //     const notification = await Notification.create(req.body)
        //     return res.json(notification)
        // } catch (e) {
        //     console.log(e)
        //     return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        // }
    });

router.put("/notification", isAuthenticated, requireRoles([0]),
    body("notificationId").isInt().custom(async id => {
        const notification = await Notification.findByPk(id)
        if (!notification) {
            throw new Error("ئاگاداری نەدۆزرایەوە")
        }
    }),
    returnInCaseOfInvalidation,
    async (req, res) => {
        try {
            const notification = await Notification.update(req.body, {where: {notificationId: req.body.notificationId}})
            return res.json(notification[0])
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    });
module.exports = router