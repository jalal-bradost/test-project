const router = require("../../config/express");
const {body, param} = require("express-validator");
const {PICUOperationType} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");

router.post("/picu/operation-type", body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const picuOperationType = req.body;
    try {
        const dbPICUOperationType = await PICUOperationType.create(picuOperationType);
        return res.json(dbPICUOperationType);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.put("/picu/operation-type", body("picuOperationTypeId").isInt().custom(async picuOperationTypeId => {
    const picuOperationType = await PICUOperationType.findByPk(picuOperationTypeId);
    if (!picuOperationType) {
        throw new Error('جۆری ئۆپەرەیشن نەدۆزرایەوە ');
    }
}), body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const picuOperationType = req.body;
    try {
        const dbPICUOperationType = await PICUOperationType.update(picuOperationType, {
            where: {
                picuOperationTypeId: picuOperationType.picuOperationTypeId
            }
        });
        return res.json(dbPICUOperationType);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/picu/operation-type/:picuOperationTypeId", param("picuOperationTypeId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {picuOperationTypeId} = req.params;
    try {
        const picuOperationType = await PICUOperationType.findByPk(picuOperationTypeId);
        if (!picuOperationType) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        return res.json(picuOperationType);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/picu/operation-types", async (req, res) => {
    try {
        const picuOperationTypes = await PICUOperationType.findAll();
        return res.json(picuOperationTypes.sort((a, b) => (a.picuOperationTypeId < b.picuOperationTypeId ? -1 : 1)));
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.delete("/picu/operation-type/:picuOperationTypeId", param("picuOperationTypeId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {picuOperationTypeId} = req.params;
    try {
        const picuOperationType = await PICUOperationType.findByPk(picuOperationTypeId);
        if (!picuOperationType) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        await picuOperationType.destroy();
        return res.json({message: "بەش سڕایەوە بە سەرکەوتوویی"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

module.exports = router;