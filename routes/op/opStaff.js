const router = require("../../config/express");
const {body, param} = require("express-validator");
const {OPStaff} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");

router.post("/op/staff",
    [
        body('shiftId').isInt(),
        body('name').notEmpty(),
        body('type').isInt(),
        returnInCaseOfInvalidation
    ],
    async (req, res) => {
        try {
            const staff = await OPStaff.create(req.body);
            return res.json(staff);
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
        }
    }
);

router.get("/op/staff/:staffId", param("staffId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const staff = await OPStaff.findByPk(req.params.staffId);
        if (!staff) {
            return res.status(400).json({message: "نەدۆزرایەوە"});
        }
        return res.json(staff);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/op/staffs", async (req, res) => {
    try {
        const staffs = await OPStaff.findAll();
        return res.json(staffs);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.put("/op/staff",
    [
        body("staffId").isInt(),
        body('shiftId').isInt(),
        body('name').notEmpty(),
        body('type').isInt(),
        returnInCaseOfInvalidation
    ],
    async (req, res) => {
        try {
            const result = await OPStaff.update(req.body, {
                where: {staffId: req.body.staffId}
            });
            if (result[0] === 0) {
                return res.status(400).json({message: "Not found"});
            }
            return res.json({message: "بەسەرکەوتوویی نوێ کرایەوە"});
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
        }
    }
);

router.delete("/op/staff/:staffId", param("staffId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const staff = await OPStaff.findByPk(req.params.staffId);
        if (!staff) {
            return res.status(400).json({message: "نەدۆزرایەوە"});
        }
        await staff.destroy();
        return res.json({message: "ڕەشکرایەوە بە سەرکەوتوویی"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});