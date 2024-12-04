const router = require("../../config/express");
const {body, param} = require("express-validator");
const {
    SWData, ProductStorage, sequelize, Patient,
    SWDataOperationTypeJunction, SWOperationType, Product, ICUData, ICUOperationType, ICUDataOperationTypeJunction,
    OPDataOperationTypeJunction, PatientPayment
} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");

// Create
router.post("/sw/data", [
    body('patientId').isInt(),
    body('entryTime').optional().isISO8601().toDate(),
    body('exitTime').optional().isISO8601().toDate(),
    body('doctorId').optional().isInt(),
    body('swOperationTypes').isArray({min: 1}),
    returnInCaseOfInvalidation
], async (req, res) => {
    const t = await sequelize.transaction();// Start a new transaction
    const {patientId, entryTime, exitTime, doctorId} = req.body;
    try {
        const swData = await SWData.create({patientId, totalPrice: 0, entryTime, exitTime, doctorId, items: []},
            {transaction: t});
        for (const swOperationTypeId of req.body.swOperationTypes) {
            await SWDataOperationTypeJunction.create({swId: swData.swId, swOperationTypeId}, {transaction: t});
        }
        await t.commit();
        return res.json(swData);
    } catch (e) {
        await t.rollback();
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

// Read
router.get("/sw/data/:swId", param("swId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const swData = await SWData.findByPk(req.params.swId, {include: [{model: Patient}, {model: SWOperationType}]});
        if (!swData) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        return res.json(swData);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});


router.get("/sw/data", async (req, res) => {
    try {
        const swDatas = await SWData.findAll({include: [{model: Patient}, {model: SWOperationType}, {model: PatientPayment}]});
        const filteredSwData = []
        for (const model of swDatas) {
            const data = model.get({plain: true});
            filteredSwData.push({
                ...data,
                items: cleanItems(data.items),
            })
        }
        return res.json(filteredSwData.sort((a, b) => (a.swId < b.swId ? 1 : -1)));
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

const cleanItems = (items) => {
    return items.map(item => ({
        barcode: item.barcode,
        product: {
            code: item.product.code,
            name: item.product.name,
            size: item.product.size,
            image: item.product.image,
            barcode: item.product.barcode,
            specialPriceUSD: item.product.specialPriceUSD
        },
        quantity: item.quantity
    }));
}

// Update
router.put("/sw/data/:swId",
    [
        param("swId").isInt(),
        body('items').exists(),
        body('totalPrice').isFloat(),
        body('entryTime').optional().isISO8601().toDate(),
        body('exitTime').optional().isISO8601().toDate(),
        body('doctorId').optional().isInt(),
        returnInCaseOfInvalidation
    ],
    async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const {swId} = req.params;
            const {items, totalPrice} = req.body;

            const swData = await SWData.findByPk(swId);
            if (!swData) {
                await t.rollback();
                return res.status(400).json({message: "بوونی نییە"});
            }

            swData.items = [...swData.items, ...items];
            swData.totalPrice += parseFloat(totalPrice);

            await swData.save({transaction: t});

            // Loop through each item to adjust product storage
            for (const item of items) {
                const toProductStorage = await ProductStorage.findAll({
                    where: {
                        barcode: item.barcode,
                        storageId: 11
                    }
                });

                if (toProductStorage.length === 0) {
                    await t.rollback();
                    return res.status(404).json({message: 'Product not found in destination storage'});
                }

                let quantity = item.quantity;
                const totalAvailableQuantity = toProductStorage.reduce((acc, current) => acc + current.quantity,
                    0);
                if (totalAvailableQuantity < quantity) {
                    await t.rollback();
                    return res.status(400).json({message: 'Not enough quantity in destination storage'});
                }

                for (const toStorage of toProductStorage) {
                    if (toStorage.quantity >= quantity) {
                        await ProductStorage.update(
                            {quantity: sequelize.literal(`quantity - ${quantity}`)},
                            {where: {productStorageId: toStorage.productStorageId}, transaction: t}
                        );
                        break;
                    } else {
                        await ProductStorage.update(
                            {quantity: sequelize.literal(`quantity - ${toStorage.quantity}`)},
                            {where: {productStorageId: toStorage.productStorageId}, transaction: t}
                        );
                        quantity -= toStorage.quantity;
                    }
                }
            }

            // Commit the transaction
            await t.commit();
            res.json({message: "SW data updated successfully"});
        } catch (e) {
            await t.rollback();
            console.log(e);
            res.status(500).json({message: "Server error occurred"});
        }
    }
);

router.put("/sw/data/:swId/details", [
    param("swId").isInt().custom(async swId => {
        const swData = await SWData.findByPk(swId);
        if (!swData) {
            throw new Error("SW data not found");
        }
    }),
    body('entryTime').optional().isISO8601().toDate(),
    body('doctorId').optional().isInt(),
    body('swOperationTypes').optional().isArray(),
    returnInCaseOfInvalidation
], async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {swId} = req.params;
        const {entryTime, exitTime, doctorId, swOperationTypes, Patient: patient, patientId} = req.body;
        const {fullname} = patient;
        await SWData.update({entryTime, exitTime, doctorId}, {where: {swId}, transaction});
        await Patient.update({fullname}, {where: {patientId}, transaction})
        if (swOperationTypes) {
            await SWDataOperationTypeJunction.destroy({where: {swId}, transaction});
            for (const swOperationTypeId of swOperationTypes) {
                await SWDataOperationTypeJunction.create({swId, swOperationTypeId}, {transaction});
            }
        }
        await transaction.commit();
        res.json({message: "SW data details has been updated successfully"});
    } catch (e) {
        console.log(e);
        await transaction.rollback();
        res.status(500).json({message: "Server error occurred"});
    }
});

router.delete("/sw/data/:swId", param("swId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const swData = await SWData.findByPk(req.params.swId);
        if (!swData) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        await swData.destroy();
        return res.json({message: "بەش سڕایەوە بە سەرکەوتوویی"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.post("/sw/item-refund", requirePermissions([permissionMap.accountant]),
    body("swId").isInt(),
    body("quantity").isInt(),
    body("selectedProduct").exists(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {selectedProduct, quantity, swId} = req.body
        try {
            const result = await sequelize.transaction(async (t) => {
                const product = await Product.findOne({where: {barcode: selectedProduct.barcode}})
                if (!product) {
                    return res.status(404).json({message: "نەدۆزرایەوە"})
                }
                const totalRefundedPrice = quantity * (selectedProduct.product.specialPriceUSD / (selectedProduct.product.perBox > 1 ? selectedProduct.product.perBox : 1))
                const swData = await SWData.findByPk(swId)
                if (!swData) {
                    return res.status(404).json({message: "نەدۆزرایەوە"})
                }
                if (quantity > selectedProduct.quantity) {
                    return res.status(400).json({message: "بڕی پێویست بەردەست نییە"})
                } else if (quantity < selectedProduct.quantity) {
                    await ProductStorage.increment({quantity},
                        {
                            where: {barcode: selectedProduct.barcode, storageId: 11},
                            transaction: t
                        })
                    let done = false;
                    const items = swData.items.map(item => {
                        if (item.barcode === selectedProduct.barcode && item.quantity === selectedProduct.quantity && !done) {
                            done = true;
                            return {
                                ...item,
                                quantity: item.quantity - quantity
                            }
                        }
                        return item
                    })
                    await swData.update({
                        totalPrice: sequelize.literal(`"totalPrice" - ${totalRefundedPrice}`),
                        items
                    }, {transaction: t})
                } else {
                    await ProductStorage.increment({quantity},
                        {
                            where: {barcode: selectedProduct.barcode, storageId: 11},
                            transaction: t
                        })
                    const item = swData.items.find(item => item.barcode === selectedProduct.barcode && item.quantity === selectedProduct.quantity)
                    const items = swData.items.filter(i => i !== item);
                    await swData.update({
                        totalPrice: sequelize.literal(`"totalPrice" - ${totalRefundedPrice}`),
                        items
                    }, {transaction: t})
                }
                await swData.save({transaction: t})
                return res.json({message: "داواکاری گەڕاندنەوە بە سەرکەوتوویی تەواوبوو"})
            });
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    });

router.post("/sw/merge", requirePermissions([permissionMap.accountant]),
    body("swCases").isArray({min: 2}),
    body("swCases.*.swId").isInt().custom(async swId => {
        const swData = await SWData.findByPk(swId);
        if (!swData) {
            throw new Error("SW data not found");
        }
    }),
    returnInCaseOfInvalidation, async (req, res) => {
        const {swCases} = req.body
        try {
            const result = await sequelize.transaction(async (t) => {
                const swDatas = await SWData.findAll({
                    where: {swId: swCases.map(sw => sw.swId)},
                    include: [{model: SWOperationType}],
                    transaction: t
                })
                // check if they are from the same patient
                const patientIds = swDatas.map(sw => sw.patientId)
                if (new Set(patientIds).size !== 1) {
                    return res.status(400).json({message: "Cases should be from the same patient"})
                }
                const totalPrice = swDatas.reduce((acc, current) => acc + current.totalPrice, 0)
                const items = swDatas.reduce((acc, current) => [...acc, ...current.items], [])
                const mergedSw = await SWData.create({
                    patientId: swDatas[0].patientId,
                    totalPrice,
                    entryTime: swDatas[0].entryTime,
                    exitTime: swDatas[0].exitTime,
                    doctorId: swDatas[0].doctorId,
                    items
                }, {transaction: t})
                const uniqueOperationTypes = new Set(swDatas.map(sw => sw.SWOperationTypes.map(swOperationType => swOperationType.swOperationTypeId)).flat())
                await SWDataOperationTypeJunction.bulkCreate(Array.from(uniqueOperationTypes).map(opTypeId => ({
                    swId: mergedSw.swId,
                    swOperationTypeId: opTypeId
                })), {transaction: t})
                await SWData.destroy({where: {swId: swCases.map(sw => sw.swId)}, transaction: t})
                return res.json({message: "SW Cases has been merged successfully"})
            });
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    });

module.exports = router;
