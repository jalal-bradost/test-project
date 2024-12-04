const router = require("../../config/express");
const {body, param} = require("express-validator");
const {PICUStaff} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");

router.post("/picu/staff",
    [
        body('shiftId').isInt(),
        body('name').notEmpty(),
        body('type').isInt(),
        returnInCaseOfInvalidation
    ],
    async (req, res) => {
        try {
            const staff = await PICUStaff.create(req.body);
            return res.json(staff);
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
        }
    }
);

router.get("/picu/staff/:staffId", param("staffId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const staff = await PICUStaff.findByPk(req.params.staffId);
        if (!staff) {
            return res.status(400).json({message: "نەدۆزرایەوە"});
        }
        return res.json(staff);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/picu/staffs", async (req, res) => {
    try {
        const staffs = await PICUStaff.findAll();
        return res.json(staffs);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.put("/picu/staff",
    [
        body("staffId").isInt(),
        body('shiftId').isInt(),
        body('name').notEmpty(),
        body('type').isInt(),
        returnInCaseOfInvalidation
    ],
    async (req, res) => {
        try {
            const result = await PICUStaff.update(req.body, {
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

router.delete("/picu/staff/:staffId", param("staffId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const staff = await PICUStaff.findByPk(req.params.staffId);
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