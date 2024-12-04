const router = require("../../config/express");
const {body, param} = require("express-validator");
const {
    PICUData, sequelize, ProductStorage, Patient, PICUDataOperationTypeJunction, Product, PICUOperationType,
    ICUData,
    ICUOperationType,
    ICUDataOperationTypeJunction, SWDataOperationTypeJunction,
} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");

// Create
router.post("/picu/data", [
    body('patientId').isInt(),
    body('staffs').exists(),
    body('doctorId').optional().isInt(),
    body('picuOperationTypes').isArray({min: 1}),
    returnInCaseOfInvalidation
], async (req, res) => {
    const t = await sequelize.transaction();// Start a new transaction
    const {patientId, staffs, doctorId} = req.body;
    try {
        const picuData = await PICUData.create({patientId, totalPrice: 0, staffs, doctorId, items: []},
            {transaction: t});
        for (const picuOperationTypeId of req.body.picuOperationTypes) {
            await PICUDataOperationTypeJunction.create({picuId: picuData.picuId, picuOperationTypeId},
                {transaction: t});
        }
        await t.commit();
        return res.json(picuData);
    } catch (e) {
        await t.rollback();
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

// Read
router.get("/picu/data/:picuId", param("picuId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const picuData = await PICUData.findByPk(req.params.picuId,
            {include: [{model: Patient}, {model: PICUOperationType}]});
        if (!picuData) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        return res.json(picuData);
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.get("/picu/data", async (req, res) => {
    try {
        const picuDatas = await PICUData.findAll({include: [{model: Patient}, {model: PICUOperationType}]});
        const filteredPicuData = []
        for (const model of picuDatas) {
            const data = model.get({plain: true});
            filteredPicuData.push({
                ...data,
                items: cleanItems(data.items),
            })
        }
        return res.json(filteredPicuData.sort((a, b) => (a.picuId < b.picuId ? 1 : -1)));
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

router.put("/picu/data/:picuId", [
    param("picuId").isInt(),
    body('items').exists(),
    body('totalPrice').isFloat(),
    body('items.*.quantity').isInt(),
    body('items.*.barcode').isString().custom(async barcode => {
        const product = await Product.findOne({where: {barcode}});
        if (!product) {
            throw new Error("Product not found");
        }
    }),
    returnInCaseOfInvalidation
], async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {picuId} = req.params;
        const {items, totalPrice} = req.body;

        const picuData = await PICUData.findByPk(picuId);
        if (!picuData) {
            await t.rollback();
            return res.status(400).json({message: "بوونی نییە"});
        }

        picuData.items = [...picuData.items, ...items];
        picuData.totalPrice += parseFloat(totalPrice);

        await picuData.save({transaction: t});

        // Loop through each item to adjust product storage
        for (const item of items) {
            const toProductStorage = await ProductStorage.findAll({
                where: {barcode: item.barcode, storageId: 17}
            });

            if (toProductStorage.length === 0) {
                await t.rollback();
                return res.status(404).json({message: 'Product not found in destination storage'});
            }

            let quantity = item.quantity;
            const totalAvailableQuantity = toProductStorage.reduce((acc, current) => acc + current.quantity, 0);
            if (totalAvailableQuantity < quantity) {
                await t.rollback();
                return res.status(400).json({message: 'Not enough quantity in destination storage'});
            }

            for (const toStorage of toProductStorage) {
                if (toStorage.quantity >= quantity) {
                    await ProductStorage.update({quantity: sequelize.literal(`quantity - ${quantity}`)},
                        {
                            where: {productStorageId: toStorage.productStorageId},
                            transaction: t
                        });
                    break;
                } else {
                    await ProductStorage.update({quantity: sequelize.literal(`quantity - ${toStorage.quantity}`)},
                        {
                            where: {productStorageId: toStorage.productStorageId},
                            transaction: t
                        });
                    quantity -= toStorage.quantity;
                }
            }
        }

        // Commit the transaction
        await t.commit();
        res.json({message: "PICU data updated successfully"});
    } catch (e) {
        await t.rollback();
        console.log(e);
        res.status(500).json({message: "Server error occurred"});
    }
});

router.put("/picu/data/:picuId/details", [
    param("picuId").isInt().custom(async picuId => {
        const picuData = await PICUData.findByPk(picuId);
        if (!picuData) {
            throw new Error("PICU data not found");
        }
    }),
    body('staffs').isArray(),
    body('doctorId').optional().isInt(),
    body("notes").isArray(),
    body('picuOperationTypes').optional().isArray(),
    returnInCaseOfInvalidation
], async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {picuId} = req.params;
        const {staffs, doctorId, notes, picuOperationTypes} = req.body;
        await PICUData.update({staffs, doctorId, notes}, {where: {picuId}, transaction});
        if (picuOperationTypes) {
            await PICUDataOperationTypeJunction.destroy({where: {picuId}, transaction});
            for (const picuOperationTypeId of picuOperationTypes) {
                await PICUDataOperationTypeJunction.create({picuId, picuOperationTypeId}, {transaction});
            }
        }
        await transaction.commit();
        res.json({message: "PICU data details has been updated successfully"});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: "Server error occurred"});
    }
});


// Delete
router.delete("/picu/data/:picuId", param("picuId").isInt(), returnInCaseOfInvalidation, requirePermissions([0]), async (req, res) => {
    try {
        const picuData = await PICUData.findByPk(req.params.picuId);
        if (!picuData) {
            return res.status(400).json({message: "بوونی نییە"});
        }
        await picuData.destroy();
        return res.json({message: "سڕایەوە بە سەرکەوتوویی"});
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"});
    }
});

router.post("/picu/item-refund", requirePermissions([permissionMap.accountant]),
    body("picuId").isInt(),
    body("quantity").isInt(),
    body("selectedProduct").exists(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {selectedProduct, quantity, picuId} = req.body
        try {
            const result = await sequelize.transaction(async (t) => {
                const product = await Product.findOne({where: {barcode: selectedProduct.barcode}})
                if (!product) {
                    return res.status(404).json({message: "نەدۆزرایەوە"})
                }
                const totalRefundedPrice = quantity * (selectedProduct.product.specialPriceUSD / (selectedProduct.product.perBox > 1 ? selectedProduct.product.perBox : 1))
                const picuData = await PICUData.findByPk(picuId)
                if (!picuData) {
                    return res.status(404).json({message: "نەدۆزرایەوە"})
                }
                if (quantity > selectedProduct.quantity) {
                    return res.status(400).json({message: "بڕی پێویست بەردەست نییە"})
                } else if (quantity < selectedProduct.quantity) {
                    await ProductStorage.increment({quantity},
                        {
                            where: {barcode: selectedProduct.barcode, storageId: 17},
                            transaction: t
                        })
                    let done = false;
                    const items = picuData.items.map(item => {
                        if (item.barcode === selectedProduct.barcode && item.quantity === selectedProduct.quantity && !done) {
                            done = true;
                            return {
                                ...item,
                                quantity: item.quantity - quantity
                            }
                        }
                        return item
                    })
                    await picuData.update({
                        totalPrice: sequelize.literal(`"totalPrice" - ${totalRefundedPrice}`),
                        items
                    }, {transaction: t})
                } else {
                    await ProductStorage.increment({quantity},
                        {
                            where: {barcode: selectedProduct.barcode, storageId: 17},
                            transaction: t
                        })
                    const item = picuData.items.find(item => item.barcode === selectedProduct.barcode && item.quantity === selectedProduct.quantity)
                    const items = picuData.items.filter(i => i !== item)
                    await picuData.update({
                        totalPrice: sequelize.literal(`"totalPrice" - ${totalRefundedPrice}`),
                        items
                    }, {transaction: t})
                }
                // await picuData.save({transaction: t})
                return res.json({message: "داواکاری گەڕاندنەوە بە سەرکەوتوویی تەواوبوو"})
            });
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    });

const timeTypes = ['obc', 'l1', 'l2', 'niv', 'iv', 'cl', 'tpn', 'cooling', 'ino']
router.put("/picu/data/:picuId/entry/:type",
    [param("picuId").isInt(), param("type").isIn(timeTypes), body("date").isISO8601().toDate()],
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {picuId, type} = req.params;
        const {date} = req.body;
        try {
            const picuCase = await PICUData.findByPk(picuId);
            if (!picuCase) {
                return res.status(404).json({message: "Case not found."});
            }
            const key = `${type}Times`;
            const times = [...picuCase[key]];
            if (times.length % 2 === 1) {
                return res.status(400).json({message: "Another entry is still open."});
            }
            const lastExit = times[times.length - 1];
            if (lastExit && date.getTime() < lastExit.getTime()) {
                return res.status(400).json({message: "Entry date cannot be before exit date."});
            }
            times.push(date);
            await PICUData.update({[key]: times}, {where: {picuId}})
            return res.status(200).json({message: "Case has been updated successfully."});
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "Something went wrong."});
        }
    });

const amountTypes = ['consultation', 'us', 'xr', 'investigation', 'milk', 'maf', 'consumables', 'transport', 'uac', 'uvc', 'fcl', 'intubation', 'piccLine', 'chestTube', 'lp', 'consultantVisit']
router.put("/picu/data/:picuId/amount/:type",
    [param("picuId").isInt(), param("type").isIn(amountTypes), body("amount").isInt()],
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {picuId, type} = req.params;
        const {amount} = req.body;
        try {
            const picuCase = await PICUData.findByPk(picuId);
            if (!picuCase) {
                return res.status(404).json({message: "Case not found."});
            }
            const key = `${type}Amount`;
            picuCase[key] += parseInt(amount);
            await picuCase.save();
            return res.status(200).json({message: "Case has been updated successfully."});
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "Something went wrong."});
        }
    });

router.put("/picu/data/:picuId/exit/:type",
    [param("picuId").isInt(), param("type").isIn(timeTypes), body("date").isISO8601().toDate()],
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {picuId, type} = req.params;
        const {date} = req.body;
        try {
            const picuCase = await PICUData.findByPk(picuId);
            if (!picuCase) {
                return res.status(404).json({message: "Case not found."});
            }
            const key = `${type}Times`;
            const times = [...picuCase[key]];
            if (times.length % 2 === 0) {
                return res.status(400).json({message: "There isn't any open entry."});
            }
            const lastEntry = times[times.length - 1];
            if (lastEntry && date.getTime() < lastEntry.getTime()) {
                return res.status(400).json({message: "Exit date cannot be before entry date."});
            }
            times.push(date);
            await PICUData.update({[key]: times}, {where: {picuId}})
            return res.status(200).json({message: "Case has been updated successfully."});
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "Something went wrong."});
        }
    });

router.post("/picu/merge", requirePermissions([permissionMap.accountant]),
    body("picuCases").isArray({min: 2}),
    body("picuCases.*.picuId").isInt().custom(async picuId => {
        const picuData = await PICUData.findByPk(picuId);
        if (!picuData) {
            throw new Error("PICU data not found");
        }
    }),
    returnInCaseOfInvalidation, async (req, res) => {
        const {picuCases} = req.body
        try {
            const result = await sequelize.transaction(async (t) => {
                const picuDatas = await PICUData.findAll({
                    where: {picuId: picuCases.map(picu => picu.picuId)},
                    include: [{model: PICUOperationType}],
                    transaction: t
                })
                // check if they are from the same patient
                const patientIds = picuDatas.map(picu => picu.patientId)
                if (new Set(patientIds).size !== 1) {
                    return res.status(400).json({message: "Cases should be from the same patient"})
                }
                const totalPrice = picuDatas.reduce((acc, current) => acc + current.totalPrice, 0)
                const items = picuDatas.reduce((acc, current) => [...acc, ...current.items], [])
                const mergedPicu = await PICUData.create({
                    patientId: picuDatas[0].patientId,
                    totalPrice,
                    staffs: picuDatas[0].staffs,
                    entryTime: picuDatas[0].entryTime,
                    exitTime: picuDatas[0].exitTime,
                    doctorId: picuDatas[0].doctorId,
                    items
                }, {transaction: t})
                const uniqueOperationTypes = new Set(picuDatas.map(picu => picu.PICUOperationTypes.map(picuOperationType => picuOperationType.picuOperationTypeId)).flat())
                await PICUDataOperationTypeJunction.bulkCreate(Array.from(uniqueOperationTypes).map(opTypeId => ({
                    picuId: mergedPicu.picuId,
                    picuOperationTypeId: opTypeId
                })), {transaction: t})
                await PICUData.destroy({where: {picuId: picuCases.map(picu => picu.picuId)}, transaction: t})
                return res.json({message: "PICU Cases has been merged successfully"})
            });
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    });

module.exports = router;