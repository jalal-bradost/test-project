const router = require("../../config/express");
const {body, param} = require("express-validator");
const {PICUShift} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");

// Create
router.post("/picu/shift",
    [
        body('name').notEmpty(),
        body('entryTime').notEmpty(),
        body('exitTime').notEmpty(),
        returnInCaseOfInvalidation
    ],
    async (req, res) => {
        try {
            const picuShift = await PICUShift.create(req.body);
            return res.json(picuShift);
        } catch (e) { 
            console.log(e);
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
        }
    }
);

// Read Single Shift
router.get("/picu/shift/:shiftId", param("shiftId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const picuShift = await PICUShift.findByPk(req.params.shiftId);
        if (!picuShift) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        return res.json(picuShift);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

// Read All Shifts
router.get("/picu/shifts", async (req, res) => {
    try {
        const picuShifts = await PICUShift.findAll();
        return res.json(picuShifts);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

// Update
router.put("/picu/shift",
    [
        body("shiftId").isInt(),
        body('name').notEmpty(),
        body('entryTime').notEmpty(),
        body('exitTime').notEmpty(),
        returnInCaseOfInvalidation
    ],
    async (req, res) => {
        try {
            const result = await PICUShift.update(req.body, {
                where: {shiftId: req.body.shiftId}
            });
            if (result[0] === 0) {
                return res.status(400).json({message: "بوونی نییە"});
            }
            return res.json({message: "نوێکردنەوەی شیفت بە سەرکەوتوویی"});
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
        }
    }
);

// Delete
router.delete("/picu/shift/:shiftId", param("shiftId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const picuShift = await PICUShift.findByPk(req.params.shiftId);
        if (!picuShift) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        await picuShift.destroy();
        return res.json({message: "شیفت سڕایەوە بە سەرکەوتوویی"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

module.exports = router;
