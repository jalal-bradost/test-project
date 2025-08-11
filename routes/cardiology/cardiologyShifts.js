const router = require("../../config/express");
const {body, param} = require("express-validator");
const {CardiologyShift} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");

// Create
router.post("/cardiology/shift",
    [
        body('name').notEmpty(),
        body('entryTime').notEmpty(),
        body('exitTime').notEmpty(),
        returnInCaseOfInvalidation
    ],
    async (req, res) => {
        try {
            const cardiologyShift = await CardiologyShift.create(req.body);
            return res.json(cardiologyShift);
        } catch (e) { 
            console.log(e);
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
        }
    }
);

// Read Single Shift
router.get("/cardiology/shift/:shiftId", param("shiftId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const cardiologyShift = await CardiologyShift.findByPk(req.params.shiftId);
        if (!cardiologyShift) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        return res.json(cardiologyShift);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

// Read All Shifts
router.get("/cardiology/shifts", async (req, res) => {
    try {
        const cardiologyShifts = await CardiologyShift.findAll();
        return res.json(cardiologyShifts);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

// Update
router.put("/cardiology/shift",
    [
        body("shiftId").isInt(),
        body('name').notEmpty(),
        body('entryTime').notEmpty(),
        body('exitTime').notEmpty(),
        returnInCaseOfInvalidation
    ],
    async (req, res) => {
        try {
            const result = await CardiologyShift.update(req.body, {
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
router.delete("/cardiology/shift/:shiftId", param("shiftId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const cardiologyShift = await CardiologyShift.findByPk(req.params.shiftId);
        if (!cardiologyShift) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        await cardiologyShift.destroy();
        return res.json({message: "شیفت سڕایەوە بە سەرکەوتوویی"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

module.exports = router;
