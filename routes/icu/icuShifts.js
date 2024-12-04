const router = require("../../config/express");
const {body, param} = require("express-validator");
const {ICUShift} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");

// Create
router.post("/icu/shift",
    [
        body('name').notEmpty(),
        body('entryTime').notEmpty(),
        body('exitTime').notEmpty(),
        returnInCaseOfInvalidation
    ],
    async (req, res) => {
        try {
            const icuShift = await ICUShift.create(req.body);
            return res.json(icuShift);
        } catch (e) { 
            console.log(e);
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
        }
    }
);

// Read Single Shift
router.get("/icu/shift/:shiftId", param("shiftId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const icuShift = await ICUShift.findByPk(req.params.shiftId);
        if (!icuShift) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        return res.json(icuShift);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

// Read All Shifts
router.get("/icu/shifts", async (req, res) => {
    try {
        const icuShifts = await ICUShift.findAll();
        return res.json(icuShifts);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

// Update
router.put("/icu/shift",
    [
        body("shiftId").isInt(),
        body('name').notEmpty(),
        body('entryTime').notEmpty(),
        body('exitTime').notEmpty(),
        returnInCaseOfInvalidation
    ],
    async (req, res) => {
        try {
            const result = await ICUShift.update(req.body, {
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
router.delete("/icu/shift/:shiftId", param("shiftId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const icuShift = await ICUShift.findByPk(req.params.shiftId);
        if (!icuShift) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        await icuShift.destroy();
        return res.json({message: "شیفت سڕایەوە بە سەرکەوتوویی"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

module.exports = router;
