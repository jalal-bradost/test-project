const router = require("../../config/express");
const {body, param} = require("express-validator");
const {SWOperationType} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");

router.post("/sw/operation-type", body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const swOperationType = req.body;
    try {
        const dbSWOperationType = await SWOperationType.create(swOperationType);
        return res.json(dbSWOperationType);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.put("/sw/operation-type", body("swOperationTypeId").isInt().custom(async swOperationTypeId => {
    const swOperationType = await SWOperationType.findByPk(swOperationTypeId);
    if (!swOperationType) {
        throw new Error('جۆری ئۆپەرەیشن نەدۆزرایەوە ');
    }
}), body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const swOperationType = req.body;
    try {
        const dbSWOperationType = await SWOperationType.update(swOperationType, {
            where: {
                swOperationTypeId: swOperationType.swOperationTypeId
            }
        });
        return res.json(dbSWOperationType);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/sw/operation-type/:swOperationTypeId", param("swOperationTypeId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {swOperationTypeId} = req.params;
    try {
        const swOperationType = await SWOperationType.findByPk(swOperationTypeId);
        if (!swOperationType) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        return res.json(swOperationType);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/sw/operation-types", async (req, res) => {
    try {
        const swOperationTypes = await SWOperationType.findAll();
        return res.json(swOperationTypes.sort((a, b) => (a.swOperationTypeId < b.swOperationTypeId ? -1 : 1)));
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.delete("/sw/operation-type/:swOperationTypeId", param("swOperationTypeId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {swOperationTypeId} = req.params;
    try {
        const swOperationType = await SWOperationType.findByPk(swOperationTypeId);
        if (!swOperationType) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        await swOperationType.destroy();
        return res.json({message: "بەش سڕایەوە بە سەرکەوتوویی"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

module.exports = router;