const router = require("../../config/express");
const {body, param} = require("express-validator");
const {OPShift} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");

// Create
router.post("/op/shift",
    [
        body('name').notEmpty(),
        body('entryTime').notEmpty(),
        body('exitTime').notEmpty(),
        returnInCaseOfInvalidation
    ],
    async (req, res) => {
        try {
            const opShift = await OPShift.create(req.body);
            return res.json(opShift);
        } catch (e) { 
            console.log(e);
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
        }
    }
);

// Read Single Shift
router.get("/op/shift/:shiftId", param("shiftId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const opShift = await OPShift.findByPk(req.params.shiftId);
        if (!opShift) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        return res.json(opShift);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

// Read All Shifts
router.get("/op/shifts", async (req, res) => {
    try {
        const opShifts = await OPShift.findAll();
        return res.json(opShifts);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

// Update
router.put("/op/shift",
    [
        body("shiftId").isInt(),
        body('name').notEmpty(),
        body('entryTime').notEmpty(),
        body('exitTime').notEmpty(),
        returnInCaseOfInvalidation
    ],
    async (req, res) => {
        try {
            const result = await OPShift.update(req.body, {
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
router.delete("/op/shift/:shiftId", param("shiftId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const opShift = await OPShift.findByPk(req.params.shiftId);
        if (!opShift) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        await opShift.destroy();
        return res.json({message: "شیفت سڕایەوە بە سەرکەوتوویی"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

module.exports = router;
