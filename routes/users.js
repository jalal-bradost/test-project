const router = require('../config/express')
const requireRoles = require("../middlware/requirePermissions")
const isAuthenticated = require("../middlware/isAuthenticatedMiddleware")
const {body, param} = require("express-validator");
const db = require("../models/index");
const path = require("path");
const fs = require("fs");
const {registerUser, updateUser} = require("../services/registerUser");
const {Role, User, Employee} = require("../models");
const returnInCaseOfInvalidation = require("../middlware/returnInCaseOfInvalidation");
const IMAGE_DIR = path.join(__dirname, '../', 'images', 'users')

router.post("/user", requireRoles([0]), body("email").isEmail().custom(async email => {
    if (await db.User.findOne({where: {email}})) {
        throw new Error('ئەم ئیمەیڵە بەکارهاتووە')
    }
}), body("password").isLength({min: 6}), body("name").notEmpty(), body("roleId").isInt().custom(async roleId => {
    if (!(await db.Role.findByPk(roleId))) {
        throw new Error('ڕۆڵێک بەم ناوە نییە')
    }
}), returnInCaseOfInvalidation, async (req, res) => {
    const user = req.body
    try {
        if (user.avatar) {
            const fileExtension = user.avatar.split(';')[0].split('/')[1]
            const base64Data = user.avatar.replace(/^data:image\/\w+;base64,/, "")
            const filename = `${new Date().getTime()}.${fileExtension}`
            const filepath = path.join(IMAGE_DIR, filename)

            try {
                fs.writeFileSync(filepath, base64Data, 'base64')
            } catch (e) {
                console.error(e)
                return res.status(500).send('Error saving image')
            }
            user.avatar = filename
        } else {
            user.avatar = "no-image.png"
        }
        const dbUser = await registerUser(user)
        return res.json(dbUser)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});

router.put("/user/:userId", requireRoles([0]), param("userId").isInt().custom(async userId => {
    if (!(await db.User.findByPk(userId))) {
        throw new Error('بەکارهێنەر نەدۆزرایەوە')
    }
}), body("email").isEmail().custom(async (email, {req}) => {
    const dbUser = await db.User.findOne({where: {email}})
    if (dbUser && dbUser.userId !== parseInt(req.params.userId)) {
        throw new Error('ئەم ئیمەیڵە بەکارهاتووە')
    }
}), body("name").notEmpty(), body("roleId").isInt().custom(async roleId => {
    if (!(await db.Role.findByPk(roleId))) {
        throw new Error('ڕۆڵێک بەم ناوە نییە')
    }
}), returnInCaseOfInvalidation, async (req, res) => {
    const user = req.body
    if (user.password === null || user.password === undefined || user.password === "") {
        delete user.password
    }
    try {
        if (user.avatar) {
            const fileExtension = user.avatar.split(';')[0].split('/')[1]
            const base64Data = user.avatar.replace(/^data:image\/\w+;base64,/, "")
            const filename = `${new Date().getTime()}.${fileExtension}`
            const filepath = path.join(IMAGE_DIR, filename)

            try {
                fs.writeFileSync(filepath, base64Data, 'base64')
            } catch (e) {
                console.error(e)
                return res.status(500).send('Error saving image')
            }
            user.avatar = filename
        } else {
            user.avatar = "no-image.png"
        }
        const dbUser = await updateUser(req.params.userId, user)
        return res.json(dbUser)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});

router.delete("/user/:userId", requireRoles([0]), param("userId").isInt().custom(async userId => {
    const dbUser = await db.User.findByPk(userId)
    if (!dbUser) {
        throw new Error('بەکارهێنەر نەدۆزرایەوە')
    }
}), returnInCaseOfInvalidation, async (req, res) => {
    const userId = req.params.userId
    if (req.user.userId === userId) {
        return res.status(400).json({message: "ناتوانیت خۆت سڕیتەوە"})
    }
    try {
        await db.sequelize.transaction(async (transaction) => {
            await db.Employee.destroy({where: {userId: userId}, transaction});
            await db.User.destroy({where: {userId: userId}, transaction});
        });
        return res.json({message: "بەکارهێنەر سڕایەوە"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/users", requireRoles([0]), async (req, res) => {
    try {
        const users = await db.User.findAll({include: [{model: Role}]})
        return res.json(users)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});

router.get("/user", isAuthenticated, async (req, res) => {
    const user = req.user
    // const userData = {email: user.email, role: user.role, name: user.name, avatar: user.avatar}
    res.status(200).json({message: "User authenticated", user})
})

module.exports = router;