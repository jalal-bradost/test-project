const router = require("../../config/express");
const {body, param} = require("express-validator");
const {SWShift} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");

// Create
router.post("/sw/shift",
    [
        body('name').notEmpty(),
        body('entryTime').notEmpty(),
        body('exitTime').notEmpty(),
        returnInCaseOfInvalidation
    ],
    async (req, res) => {
        try {
            const swShift = await SWShift.create(req.body);
            return res.json(swShift);
        } catch (e) { 
            console.log(e);
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
        }
    }
);

// Read Single Shift
router.get("/sw/shift/:shiftId", param("shiftId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const swShift = await SWShift.findByPk(req.params.shiftId);
        if (!swShift) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        return res.json(swShift);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

// Read All Shifts
router.get("/sw/shifts", async (req, res) => {
    try {
        const swShifts = await SWShift.findAll();
        return res.json(swShifts);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

// Update
router.put("/sw/shift",
    [
        body("shiftId").isInt(),
        body('name').notEmpty(),
        body('entryTime').notEmpty(),
        body('exitTime').notEmpty(),
        returnInCaseOfInvalidation
    ],
    async (req, res) => {
        try {
            const result = await SWShift.update(req.body, {
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
router.delete("/sw/shift/:shiftId", param("shiftId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const swShift = await SWShift.findByPk(req.params.shiftId);
        if (!swShift) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        await swShift.destroy();
        return res.json({message: "شیفت سڕایەوە بە سەرکەوتوویی"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

module.exports = router;
