const router = require("../../config/express");
const {body, param} = require("express-validator");
const {
    OPData,
    ProductStorage,
    sequelize,
    Patient,
    OPDataOperationTypeJunction,
    OPOperationType, SWData, Product, ICUData, ICUOperationType, ICUDataOperationTypeJunction, PatientPayment,
    SurgeryCase
} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");

router.post("/op/data", [
    body('patientId').isInt(),
    body('entryTime').optional().isISO8601().toDate(),
    body('exitTime').optional().isISO8601().toDate(),
    body('doctorId').optional().isInt(),
    body('opOperationTypes').isArray({min: 1}),
    returnInCaseOfInvalidation
], async (req, res) => {
    const t = await sequelize.transaction();
    const {patientId, totalPrice, entryTime, exitTime, doctorId} = req.body;
    try {
        const opData = await OPData.create({
            patientId,
            totalPrice: 0,
            entryTime,
            exitTime,
            doctorId,
            totalPriceScrubNurse: 0,
            totalPriceAnesthesia: 0,
            totalPricePerfusion: 0,
            items: [],
            scrubNurseItems: [],
            anesthesiaItems: [],
            perfusionItems: []
        }, {transaction: t});
        for (const opOperationTypeId of req.body.opOperationTypes) {
            await OPDataOperationTypeJunction.create({opId: opData.opId, opOperationTypeId}, {transaction: t});
        }
        await t.commit();
        return res.json(opData);
    } catch (e) {
        await t.rollback();
        console.log(e);
        return res.status(500).json({message: "Server error occurred"});
    }
});

router.get("/op/data/:opId", param("opId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const opData = await OPData.findByPk(req.params.opId, {include: [{model: Patient}, {model: OPOperationType}]});
        if (!opData) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        return res.json(opData);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/op/data", async (req, res) => {
    try {
        const opDatas = await OPData.findAll({
            include: [{model: Patient}, {model: OPOperationType}, {
                model: PatientPayment, attributes: {include: ["surgeryCaseId"]}, include: [{
                    model: SurgeryCase, as: "surgeryCase"
                }]
            }]
        });
        const filteredOpData = []
        for (const model of opDatas) {
            const data = model.get({plain: true});
            filteredOpData.push({
                ...data,
                perfusionItems: cleanItems(data.perfusionItems),
                anesthesiaItems: cleanItems(data.anesthesiaItems),
                scrubNurseItems: cleanItems(data.scrubNurseItems)
            })
        }
        return res.json(filteredOpData.sort((a, b) => (a.opId < b.opId ? 1 : -1)));
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

const cleanItems = (items) => {
    return items.map(item => ({
        barcode: item.barcode,
        product: {
            // code: item.product.code,
            name: item.product.name,
            size: item.product.size,
            image: item.product.image,
            // barcode: item.product.barcode,
            specialPriceUSD: item.product.specialPriceUSD,
            perBox: item.product.perBox
        },
        quantity: item.quantity
    }));
}

router.put("/op/data/:opId", [
    param("opId").isInt(),
    body('scrubNurseItems').exists(),
    body('perfusionItems').exists(),
    body('anesthesiaItems').exists(),
    body('totalPrice').isFloat(),
    body('totalPriceScrubNurse').isFloat(),
    body('totalPriceAnesthesia').isFloat(),
    body('totalPricePerfusion').isFloat(),
    returnInCaseOfInvalidation
], async (req, res) => {
    const t = await sequelize.transaction();
    try {

        // Begin updates
        const opData = await OPData.findByPk(req.params.opId);
        if (!opData) {
            await t.rollback();
            return res.status(400).json({message: "بوونی نییە"});
        }

        opData.scrubNurseItems = [...opData.scrubNurseItems, ...req.body.scrubNurseItems];
        opData.perfusionItems = [...opData.perfusionItems, ...req.body.perfusionItems];
        opData.anesthesiaItems = [...opData.anesthesiaItems, ...req.body.anesthesiaItems];
        opData.totalPrice += parseFloat(req.body.totalPrice);
        opData.totalPriceScrubNurse += parseFloat(req.body.totalPriceScrubNurse);
        opData.totalPriceAnesthesia += parseFloat(req.body.totalPriceAnesthesia);
        opData.totalPricePerfusion += parseFloat(req.body.totalPricePerfusion);

        await opData.save({transaction: t});

        await adjustProductStorage(req.body.scrubNurseItems, 10, t);
        await adjustProductStorage(req.body.perfusionItems, 8, t);
        await adjustProductStorage(req.body.anesthesiaItems, 9, t);

        await t.commit();
        return res.json({message: "نوێکردنەوەی ئایتم بە سەرکەوتوویی"});
    } catch (e) {
        await t.rollback();
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.put("/op/data/:opId/bypass", [
    param("opId").isInt(),
    body('isBypass').isBoolean(),
    returnInCaseOfInvalidation
], async (req, res) => {
    const {isBypass} = req.body;
    try {
        const opData = await OPData.findByPk(req.params.opId);
        if (!opData) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        opData.isBypass = isBypass
        await opData.save();
        return res.json({message: "OP updated successfully"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});


router.delete("/op/data/:opId", param("opId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const opData = await OPData.findByPk(req.params.opId);
        if (!opData) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        await opData.destroy();
        return res.json({message: "بەش سڕایەوە بە سەرکەوتوویی"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.put("/op/data/:opId/details", [
    param("opId").isInt().custom(async opId => {
        const opData = await OPData.findByPk(opId);
        if (!opData) {
            throw new Error("OP data not found");
        }
    }),
    body('entryTime').isISO8601().toDate(),
    body('doctorId').optional().isInt(),
    body('opOperationTypes').optional().isArray(),
    returnInCaseOfInvalidation
], async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {opId} = req.params;
        const {entryTime, exitTime, doctorId, opOperationTypes} = req.body;
        await OPData.update({entryTime, exitTime, doctorId}, {where: {opId}, transaction});
        if (opOperationTypes) {
            await OPDataOperationTypeJunction.destroy({where: {opId}, transaction});
            for (const opOperationTypeId of opOperationTypes) {
                await OPDataOperationTypeJunction.create({opId, opOperationTypeId}, {transaction});
            }
        }
        await transaction.commit();
        res.json({message: "OP data details successfully"});
    } catch (e) {
        console.log(e);
        await transaction.rollback();
        res.status(500).json({message: "Server error occurred"});
    }
});

const adjustProductStorage = async (items, storageId, t) => {
    for (const item of items) {
        const productStorage = await ProductStorage.findAll({
            where: {barcode: item.barcode, storageId: storageId}
        });

        if (!productStorage.length) {
            throw new Error('Product not found in storage');
        }

        let quantityToDeduct = item.quantity;
        for (const storage of productStorage) {
            if (quantityToDeduct <= storage.quantity) {
                storage.quantity -= quantityToDeduct;
                quantityToDeduct = 0;
                await storage.save({transaction: t});
                break;
            } else {
                quantityToDeduct -= storage.quantity;
                await storage.destroy({transaction: t});
            }
        }

        if (quantityToDeduct > 0) {
            throw new Error(`Not enough quantity in storage for barcode ${item.barcode} and storageId ${storageId} with quantity of ${item.quantity}`);
        }
    }
};

router.put("/op/data/:opId/details", [
    param("opId").isInt().custom(async opId => {
        const opData = await OPData.findByPk(opId);
        if (!opData) {
            throw new Error("OP data not found");
        }
    }),
    body('entryTime').optional().isISO8601().toDate(),
    body('doctorId').optional().isInt(),
    returnInCaseOfInvalidation
], async (req, res) => {
    try {
        const {opId} = req.params;
        const {entryTime, exitTime, doctorId} = req.body;
        await OPData.update({entryTime, exitTime, doctorId}, {where: {opId}});
        res.json({message: "OP data details has been updated successfully"});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: "Server error occurred"});
    }
});

router.post("/op/anesthesia-item-refund", requirePermissions([permissionMap.accountant, permissionMap.opOrder]),
    body("opId").isInt(),
    body("quantity").isInt(),
    body("selectedProduct").exists(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {selectedProduct, quantity, opId} = req.body
        try {
            const result = await sequelize.transaction(async (t) => {
                const product = await Product.findOne({where: {barcode: selectedProduct.barcode}})
                if (!product) {
                    return res.status(404).json({message: "نەدۆزرایەوە"})
                }
                const totalRefundedPrice = quantity * (selectedProduct.product.specialPriceUSD / (selectedProduct.product.perBox > 1 ? selectedProduct.product.perBox : 1))
                const opData = await OPData.findByPk(opId)
                if (!opData) {
                    return res.status(404).json({message: "نەدۆزرایەوە"})
                }
                if (quantity > selectedProduct.quantity) {
                    return res.status(400).json({message: "بڕی پێویست بەردەست نییە"})
                } else if (quantity < selectedProduct.quantity) {
                    await ProductStorage.increment({quantity},
                        {
                            where: {barcode: selectedProduct.barcode, storageId: 9},
                            transaction: t
                        })
                    let done = false;
                    const anesthesiaItems = opData.anesthesiaItems.map(anesthesiaItem => {
                        if (anesthesiaItem.barcode === selectedProduct.barcode && anesthesiaItem.quantity === selectedProduct.quantity && !done) {
                            done = true;
                            return {
                                ...anesthesiaItem,
                                quantity: anesthesiaItem.quantity - quantity
                            }
                        }
                        return anesthesiaItem
                    })
                    await opData.update({
                        totalPrice: sequelize.literal(`"totalPrice" - ${totalRefundedPrice}`),
                        anesthesiaItems
                    }, {transaction: t})
                } else {
                    await ProductStorage.increment({quantity},
                        {
                            where: {barcode: selectedProduct.barcode, storageId: 9},
                            transaction: t
                        })
                    const anesthesiaItem = opData.anesthesiaItems.find(anesthesiaItem => anesthesiaItem.barcode === selectedProduct.barcode && anesthesiaItem.quantity === selectedProduct.quantity)
                    const anesthesiaItems = opData.anesthesiaItems.filter(i => i !== anesthesiaItem);
                    await opData.update({
                        totalPrice: sequelize.literal(`"totalPrice" - ${totalRefundedPrice}`),
                        anesthesiaItems,
                        totalPriceAnesthesia: sequelize.literal(`"totalPriceAnesthesia" - ${totalRefundedPrice}`),
                    }, {transaction: t})
                }
                await opData.save({transaction: t})
                return res.json({message: "داواکاری گەڕاندنەوە بە سەرکەوتوویی تەواوبوو"})
            });
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    });

router.post("/op/perfusion-item-refund", requirePermissions([permissionMap.accountant, permissionMap.opOrder]),
    body("opId").isInt(),
    body("quantity").isInt(),
    body("selectedProduct").exists(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {selectedProduct, quantity, opId} = req.body
        try {
            const result = await sequelize.transaction(async (t) => {
                const product = await Product.findOne({where: {barcode: selectedProduct.barcode}})
                if (!product) {
                    return res.status(404).json({message: "نەدۆزرایەوە"})
                }
                const totalRefundedPrice = quantity * (selectedProduct.product.specialPriceUSD / (selectedProduct.product.perBox > 1 ? selectedProduct.product.perBox : 1))
                const opData = await OPData.findByPk(opId)
                if (!opData) {
                    return res.status(404).json({message: "نەدۆزرایەوە"})
                }
                if (quantity > selectedProduct.quantity) {
                    return res.status(400).json({message: "بڕی پێویست بەردەست نییە"})
                } else if (quantity < selectedProduct.quantity) {
                    await ProductStorage.increment({quantity},
                        {
                            where: {barcode: selectedProduct.barcode, storageId: 8},
                            transaction: t
                        })
                    let done = false;
                    const perfusionItems = opData.perfusionItems.map(perfusionItem => {
                        if (perfusionItem.barcode === selectedProduct.barcode && perfusionItem.quantity === selectedProduct.quantity && !done) {
                            done = true;
                            return {
                                ...perfusionItem,
                                quantity: perfusionItem.quantity - quantity
                            }
                        }
                        return perfusionItem
                    })
                    await opData.update({
                        totalPrice: sequelize.literal(`"totalPrice" - ${totalRefundedPrice}`),
                        perfusionItems
                    }, {transaction: t})
                } else {
                    await ProductStorage.increment({quantity},
                        {
                            where: {barcode: selectedProduct.barcode, storageId: 8},
                            transaction: t
                        })
                    const item = opData.perfusionItems.find(perfusionItem => perfusionItem.barcode === selectedProduct.barcode && perfusionItem.quantity === selectedProduct.quantity)
                    const perfusionItems = opData.perfusionItems.filter(i => i !== item)
                    await opData.update({
                        totalPrice: sequelize.literal(`"totalPrice" - ${totalRefundedPrice}`),
                        totalPricePerfusion: sequelize.literal(`"totalPricePerfusion" - ${totalRefundedPrice}`),
                        perfusionItems
                    }, {transaction: t})
                }
                await opData.save({transaction: t})
                return res.json({message: "داواکاری گەڕاندنەوە بە سەرکەوتوویی تەواوبوو"})
            });
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    });

router.post("/op/scrub-nurse-item-refund", requirePermissions([permissionMap.accountant, permissionMap.opOrder]),
    body("opId").isInt(),
    body("quantity").isInt(),
    body("selectedProduct").exists(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {selectedProduct, quantity, opId} = req.body
        try {
            const result = await sequelize.transaction(async (t) => {
                const product = await Product.findOne({where: {barcode: selectedProduct.barcode}})
                if (!product) {
                    return res.status(404).json({message: "نەدۆزرایەوە"})
                }
                const totalRefundedPrice = quantity * (selectedProduct.product.specialPriceUSD / (selectedProduct.product.perBox > 1 ? selectedProduct.product.perBox : 1))
                const opData = await OPData.findByPk(opId)
                if (!opData) {
                    return res.status(404).json({message: "نەدۆزرایەوە"})
                }
                if (quantity > selectedProduct.quantity) {
                    return res.status(400).json({message: "بڕی پێویست بەردەست نییە"})
                } else if (quantity < selectedProduct.quantity) {
                    await ProductStorage.increment({quantity},
                        {
                            where: {barcode: selectedProduct.barcode, storageId: 8},
                            transaction: t
                        })
                    let done = false;
                    const scrubNurseItems = opData.scrubNurseItems.map(scrubNurseItem => {
                        if (scrubNurseItem.barcode === selectedProduct.barcode && scrubNurseItem.quantity === selectedProduct.quantity && !done) {
                            done = true;
                            return {
                                ...scrubNurseItem,
                                quantity: scrubNurseItem.quantity - quantity
                            }
                        }
                        return scrubNurseItem
                    })
                    await opData.update({
                        totalPrice: sequelize.literal(`"totalPrice" - ${totalRefundedPrice}`),
                        totalPriceScrubNurse: sequelize.literal(`"totalPriceScrubNurse" - ${totalRefundedPrice}`),
                        scrubNurseItems
                    }, {transaction: t})
                } else {
                    await ProductStorage.increment({quantity},
                        {
                            where: {barcode: selectedProduct.barcode, storageId: 8},
                            transaction: t
                        })
                    const item = opData.scrubNurseItems.find(scrubNurseItem => scrubNurseItem.barcode === selectedProduct.barcode && scrubNurseItem.quantity === selectedProduct.quantity)
                    const scrubNurseItems = opData.scrubNurseItems.filter(i => item !== i);
                    await opData.update({
                        totalPrice: sequelize.literal(`"totalPrice" - ${totalRefundedPrice}`),
                        scrubNurseItems
                    }, {transaction: t})
                }
                await opData.save({transaction: t})
                return res.json({message: "داواکاری گەڕاندنەوە بە سەرکەوتوویی تەواوبوو"})
            });
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    });

router.post("/op/merge", requirePermissions([permissionMap.accountant]),
    body("opCases").isArray({min: 2}),
    body("opCases.*.opId").isInt().custom(async opId => {
        const opData = await OPData.findByPk(opId);
        if (!opData) {
            throw new Error("OP data not found");
        }
    }),
    returnInCaseOfInvalidation, async (req, res) => {
        const {opCases} = req.body
        try {
            const result = await sequelize.transaction(async (t) => {
                const opDatas = await OPData.findAll({
                    where: {opId: opCases.map(op => op.opId)},
                    include: [{model: OPOperationType}],
                    transaction: t
                })
                // check if they are from the same patient
                const patientIds = opDatas.map(op => op.patientId)
                if (new Set(patientIds).size !== 1) {
                    return res.status(400).json({message: "Cases should be from the same patient"})
                }
                const totalPrice = opDatas.reduce((acc, current) => acc + current.totalPrice, 0)
                const totalPriceScrubNurse = opDatas.reduce((acc, current) => acc + current.totalPriceScrubNurse, 0)
                const totalPriceAnesthesia = opDatas.reduce((acc, current) => acc + current.totalPriceAnesthesia, 0)
                const totalPricePerfusion = opDatas.reduce((acc, current) => acc + current.totalPricePerfusion, 0)
                const perfusionItems = opDatas.reduce((acc, current) => [...acc, ...current.perfusionItems], [])
                const anesthesiaItems = opDatas.reduce((acc, current) => [...acc, ...current.anesthesiaItems], [])
                const scrubNurseItems = opDatas.reduce((acc, current) => [...acc, ...current.scrubNurseItems], [])
                const mergedOp = await OPData.create({
                    patientId: opDatas[0].patientId,
                    totalPrice,
                    totalPriceScrubNurse,
                    totalPriceAnesthesia,
                    totalPricePerfusion,
                    entryTime: opDatas[0].entryTime,
                    exitTime: opDatas[0].exitTime,
                    doctorId: opDatas[0].doctorId,
                    perfusionItems,
                    anesthesiaItems,
                    scrubNurseItems
                }, {transaction: t})
                const uniqueOperationTypes = new Set(opDatas.map(op => op.OPOperationTypes.map(opOperationType => opOperationType.opOperationTypeId)).flat())
                await OPDataOperationTypeJunction.bulkCreate(Array.from(uniqueOperationTypes).map(opTypeId => ({
                    opId: mergedOp.opId,
                    opOperationTypeId: opTypeId
                })), {transaction: t})
                await OPData.destroy({where: {opId: opCases.map(op => op.opId)}, transaction: t})
                return res.json({message: "OP Cases has been merged successfully"})
            });
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    });

module.exports = router;
