const router = require("../../config/express");
const {body, param} = require("express-validator");
const {ICUOperationType} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");

router.post("/icu/operation-type", body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const icuOperationType = req.body;
    try {
        const dbICUOperationType = await ICUOperationType.create(icuOperationType);
        return res.json(dbICUOperationType);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.put("/icu/operation-type", body("icuOperationTypeId").isInt().custom(async icuOperationTypeId => {
    const icuOperationType = await ICUOperationType.findByPk(icuOperationTypeId);
    if (!icuOperationType) {
        throw new Error('جۆری ئۆپەرەیشن نەدۆزرایەوە ');
    }
}), body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const icuOperationType = req.body;
    try {
        const dbICUOperationType = await ICUOperationType.update(icuOperationType, {
            where: {
                icuOperationTypeId: icuOperationType.icuOperationTypeId
            }
        });
        return res.json(dbICUOperationType);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/icu/operation-type/:icuOperationTypeId", param("icuOperationTypeId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {icuOperationTypeId} = req.params;
    try {
        const icuOperationType = await ICUOperationType.findByPk(icuOperationTypeId);
        if (!icuOperationType) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        return res.json(icuOperationType);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/icu/operation-types", async (req, res) => {
    try {
        const icuOperationTypes = await ICUOperationType.findAll();
        return res.json(icuOperationTypes.sort((a, b) => (a.icuOperationTypeId < b.icuOperationTypeId ? -1 : 1)));
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.delete("/icu/operation-type/:icuOperationTypeId", param("icuOperationTypeId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {icuOperationTypeId} = req.params;
    try {
        const icuOperationType = await ICUOperationType.findByPk(icuOperationTypeId);
        if (!icuOperationType) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        await icuOperationType.destroy();
        return res.json({message: "بەش سڕایەوە بە سەرکەوتوویی"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

module.exports = router;