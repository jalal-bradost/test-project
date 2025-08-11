const router = require("../../config/express");
const {body, param} = require("express-validator");
const {CardiologyOperationType} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");

router.post("/cardiology/operation-type", body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const cardiologyOperationType = req.body;
    try {
        const dbCardiologyOperationType = await CardiologyOperationType.create(cardiologyOperationType);
        return res.json(dbCardiologyOperationType);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.put("/cardiology/operation-type", body("cardiologyOperationTypeId").isInt().custom(async cardiologyOperationTypeId => {
    const cardiologyOperationType = await CardiologyOperationType.findByPk(cardiologyOperationTypeId);
    if (!cardiologyOperationType) {
        throw new Error('جۆری ئۆپەرەیشن نەدۆزرایەوە ');
    }
}), body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const cardiologyOperationType = req.body;
    try {
        const dbCardiologyOperationType = await CardiologyOperationType.update(cardiologyOperationType, {
            where: {
                cardiologyOperationTypeId: cardiologyOperationType.cardiologyOperationTypeId
            }
        });
        return res.json(dbCardiologyOperationType);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/cardiology/operation-type/:cardiologyOperationTypeId", param("cardiologyOperationTypeId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {cardiologyOperationTypeId} = req.params;
    try {
        const cardiologyOperationType = await CardiologyOperationType.findByPk(cardiologyOperationTypeId);
        if (!cardiologyOperationType) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        return res.json(cardiologyOperationType);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/cardiology/operation-types", async (req, res) => {
    try {
        const cardiologyOperationTypes = await CardiologyOperationType.findAll();
        return res.json(cardiologyOperationTypes.sort((a, b) => (a.cardiologyOperationTypeId < b.cardiologyOperationTypeId ? -1 : 1)));
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.delete("/cardiology/operation-type/:cardiologyOperationTypeId", param("cardiologyOperationTypeId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {cardiologyOperationTypeId} = req.params;
    try {
        const cardiologyOperationType = await CardiologyOperationType.findByPk(cardiologyOperationTypeId);
        if (!cardiologyOperationType) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        await cardiologyOperationType.destroy();
        return res.json({message: "بەش سڕایەوە بە سەرکەوتوویی"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

module.exports = router;