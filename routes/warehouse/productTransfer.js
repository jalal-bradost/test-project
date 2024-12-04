const router = require("../../config/express");
const {body} = require("express-validator");
const {Storage, Transfer, ProductStorage, sequelize, Product} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");
const isAuthenticated = require("../../middlware/isAuthenticatedMiddleware");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");

router.post("/warehouse/transfer", requirePermissions([permissionMap.transferProduct]),
    body("products.*.fromProductStorage").exists(),
    body("products.*.quantity").isInt(),
    body("toStorageId").isInt().custom(async (toStorageId, {req}) => {
        const toStorage = await Storage.findByPk(toStorageId);
        if (!toStorage) {
            throw new Error("مەخزەن بوونی نییە");
        }
    }),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {toStorageId, products} = req.body;
        try {
            // Start a transaction
            await sequelize.transaction(async (t) => {
                const transfer = await Transfer.create({
                    toStorageId,
                    products,
                }, {transaction: t});

                for (const p of products) {
                    const {fromProductStorage, quantity, product, specialPriceUSD} = p;
                    const productStorage = await ProductStorage.findOne({where: {productStorageId: fromProductStorage.productStorageId, barcode: product.barcode}, transaction: t});
                    // await Product.update({specialPriceUSD: specialPriceUSD / quantity * product.perBox}, {
                    //     where: {barcode: product.barcode},
                    //     transaction: t
                    // });
                    if(!productStorage){
                        throw new Error(`ProductStorage not found for product (${product.barcode}) on Storage (${fromProductStorage.storageId}) with ProductStorageId of (${fromProductStorage.productStorageId}) ${JSON.stringify(productStorage)}, ${quantity}`)
                    }
                    if (productStorage.quantity < quantity) {
                        throw new Error(`There isn't enough quantity for product (${product.barcode}) on Storage (${fromProductStorage.storageId}) with ProductStorageId of (${fromProductStorage.productStorageId}) ${JSON.stringify(productStorage)}, ${quantity}`)
                    }
                    await productStorage.decrement(
                        {quantity},
                        {transaction: t}
                    );

                    const newProductStorage = await ProductStorage.findOne({
                        where: {
                            barcode: productStorage.barcode,
                            productionDate: productStorage.productionDate,
                            expireDate: productStorage.expireDate,
                            storageId: toStorageId
                        },
                        transaction: t
                    });
                    if (newProductStorage) {
                        await newProductStorage.increment({quantity: parseInt(quantity)}, {transaction: t});
                    } else {
                        await ProductStorage.create({
                            barcode: productStorage.barcode,
                            productionDate: productStorage.productionDate,
                            expireDate: productStorage.expireDate,
                            storageId: toStorageId,
                            quantity: parseInt(quantity)
                        }, {transaction: t});
                    }
                }
            });

            return res.json({message: "گواستنەوە سەرکەوتوو بوو"});
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "گواستنەوە سەرکەوتوو نەبوو، هەڵەیەک لە سێرڤەر ڕوویدا", error: e});
        }
    }
);

router.delete('/warehouse/transfer/:transferId', requirePermissions([permissionMap.transferProduct]), async (req, res) => {
    const {transferId} = req.params;
    try {
        await sequelize.transaction(async (t) => {
            const transfer = await Transfer.findByPk(transferId, {transaction: t});
            if (!transfer) {
                return res.status(404).json({message: 'Transfer not found'});
            }

            // Assuming `transfer.products` is an array of product details
            for (const p of transfer.products) {
                let {fromProductStorage, quantity, product} = p;
                // Return the products to the original storage
                await ProductStorage.increment(
                    {quantity: quantity},
                    {where: {productStorageId: fromProductStorage.productStorageId}, transaction: t}
                );
                // Reduce the quantity of products in the destination storage or delete if it's empty
                const toProductStorage = await ProductStorage.findAll({
                    where: {
                        barcode: fromProductStorage.barcode,
                        productionDate: fromProductStorage.productionDate,
                        expireDate: fromProductStorage.expireDate,
                        storageId: transfer.toStorageId
                    }
                }, {transaction: t})

                if (toProductStorage.length === 0) {
                    throw new Error('Product not found in destination storage');
                }
                const totalAvailableQuantity = toProductStorage.reduce((acc, current) => {
                    return acc + current.quantity;
                });
                if (totalAvailableQuantity < quantity) {
                    throw new Error('Not enough quantity in destination storage');
                }
                for (const toStorage of toProductStorage) {
                    if (toStorage.quantity >= quantity) {
                        if (toStorage.quantity - quantity === 0) {
                            await toStorage.destroy({transaction: t});
                            break;
                        }
                        await ProductStorage.decrement(
                            {quantity: quantity},
                            {where: {productStorageId: toStorage.productStorageId}, transaction: t}
                        );
                        break;
                    } else {
                        await ProductStorage.decrement(
                            {quantity: toStorage.quantity},
                            {where: {productStorageId: toStorage.productStorageId}, transaction: t}
                        );
                        quantity -= toStorage.quantity;
                    }
                }
            }

            // Delete the transfer after returning all products
            await transfer.destroy({transaction: t});
            res.json({message: 'Transfer cancelled and products returned'});
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({message: 'Server error'});
    }
});


router.get("/warehouse/transfers", requirePermissions([permissionMap.transferProduct]), async (req, res) => {
    try {
        const transfers = await Transfer.findAll({include: [{model: Storage, as: "toStorage"}]});
        return res.json(transfers.sort((a, b) => (a.transferId < b.transferId ? 1 : -1)));
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "هەڵەیەک لە سێرڤەر ڕوویدا"});
    }
});

module.exports = router;
