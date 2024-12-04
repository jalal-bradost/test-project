const router = require("../../config/express");
const {body, param} = require("express-validator");
const {OPOperationType} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");

router.post("/op/operation-type", body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const opOperationType = req.body;
    try {
        const dbOPOperationType = await OPOperationType.create(opOperationType);
        return res.json(dbOPOperationType);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.put("/op/operation-type", body("opOperationTypeId").isInt().custom(async opOperationTypeId => {
    const opOperationType = await OPOperationType.findByPk(opOperationTypeId);
    if (!opOperationType) {
        throw new Error('جۆری ئۆپەرەیشن نەدۆزرایەوە ');
    }
}), body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const opOperationType = req.body;
    try {
        const dbOPOperationType = await OPOperationType.update(opOperationType, {
            where: {
                opOperationTypeId: opOperationType.opOperationTypeId
            }
        });
        return res.json(dbOPOperationType);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/op/operation-type/:opOperationTypeId", param("opOperationTypeId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {opOperationTypeId} = req.params;
    try {
        const opOperationType = await OPOperationType.findByPk(opOperationTypeId);
        if (!opOperationType) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        return res.json(opOperationType);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/op/operation-types", async (req, res) => {
    try {
        const opOperationTypes = await OPOperationType.findAll();
        return res.json(opOperationTypes.sort((a, b) => (a.opOperationTypeId < b.opOperationTypeId ? -1 : 1)));
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.delete("/op/operation-type/:opOperationTypeId", param("opOperationTypeId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {opOperationTypeId} = req.params;
    try {
        const opOperationType = await OPOperationType.findByPk(opOperationTypeId);
        if (!opOperationType) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        await opOperationType.destroy();
        return res.json({message: "بەش سڕایەوە بە سەرکەوتوویی"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

module.exports = router;