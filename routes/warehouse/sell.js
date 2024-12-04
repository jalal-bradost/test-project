const router = require("../../config/express")
const {body, param} = require("express-validator")
const {Sell, ProductStorage, SellDebt, Product, Customer} = require("../../models")
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation")
const fs = require('fs')
const path = require('path')
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
const IMAGE_DIR = path.join(__dirname, '../', '../', 'images', 'sells')

if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR)
}

router.post("/warehouse/sell", requirePermissions([permissionMap.sellProduct]),
    body("products.*.product.barcode").notEmpty().custom(async barcode => {
        const product = await Product.findByPk(barcode)
        if (!product) {
            throw new Error('Product is not found')
        }
    }),
    body("paymentType").notEmpty(),
    body("products.*.productStorageId").isInt().custom(async productStorageId => {
        const storage = await ProductStorage.findByPk(productStorageId)
        if (!storage) {
            throw new Error('Product Storage is not found')
        }
    }),
    body("products.*.quantity").isInt(),
    body("products.*.price").isFloat(),
    body("totalPrice").isFloat(),
    body("currency").notEmpty(),
    body("date").isISO8601().toDate(),
    body("customerId").isInt().custom(async customerId => {
        const customer = await Customer.findByPk(customerId)
        if (!customer) {
            throw new Error('Customer is not found')
        }
    }), returnInCaseOfInvalidation, async (req, res) => {
        const sell = req.body
        try {
            // Iterate over products to save details in ProductInvoice and ProductStorage
            const dbProducts = []
            for (const product of sell.products) {
                const dbProductStorage = await ProductStorage.findByPk(product.productStorageId)
                if (dbProductStorage.quantity < product.quantity) {
                    return res.status(400).json({message: "بڕی پێویست بەردەست نییە"})
                }
                dbProductStorage.quantity -= product.quantity
                dbProducts.push(dbProductStorage)
            }
            for (const dbProductStorage of dbProducts) {
                await dbProductStorage.save()
            }
            const newSell = await Sell.create(sell);
            if (sell.paymentType === 'debt') {
                await SellDebt.create({
                    sellId: newSell.sellId, paidAmount: 0
                })
            }
            return res.json(newSell)
        } catch (e) {
            console.error(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    })

router.get("/warehouse/sell/:sellId", requirePermissions([permissionMap.sellProduct]), async (req, res) => {
    const sellId = req.params.sellId
    try {
        const sell = await Sell.findByPk(sellId)
        if (!sell) {
            return res.status(404).json({message: "Sell not found"})
        }
        return res.json(sell)
    } catch (e) {
        console.error(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/warehouse/sells", requirePermissions([permissionMap.sellProduct]), async (req, res) => {
    try {
        const sells = await Sell.findAll({
            include: [{
                model: Customer,
            }, {
                model: SellDebt,
                required: false
            }]
        });
        return res.json(sells.sort((a, b) => (a.sellId < b.sellId ? 1 : -1)))
    } catch (e) {
        console.error(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.delete("/warehouse/sell/:sellId", requirePermissions([permissionMap.sellProduct]), param("sellId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const sell = await Sell.findByPk(req.params.sellId)
        for (const product of sell.products) {
            const dbProductStorage = await ProductStorage.findByPk(product.productStorageId)
            if (!dbProductStorage) {
                console.error(`No storage was found for ${product} of sell: ${sell}`)
                continue;
            }
            dbProductStorage.quantity += parseInt(product.quantity)
            await dbProductStorage.save()
        }
        await sell.destroy()
        return res.json({message: "کڕین سڕایەوە بە سەرکەوتوویی"})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});
router.post("/warehouse/sell-refund", requirePermissions([permissionMap.sellProduct]),
    body("sellId").isInt(),
    body("quantity").isInt(),
    body("selectedProduct.productStorageId").isInt(),

    returnInCaseOfInvalidation,
    async (req, res) => {
        const {selectedProduct, quantity, sellId} = req.body
        if (quantity % selectedProduct.product.perBox !== 0) {
            return res.status(400).json({message: "هەڵەیەک هەیە لە ڕێژەی بۆکس"})
        }
        try {
            const productStorage = await ProductStorage.findByPk(selectedProduct.productStorageId)
            if (!productStorage) {
                return res.status(404).json({message: "ئەم پڕۆدەکتە لە مەخزەن نەدۆزرایەوە"})
            }
            const sell = await Sell.findByPk(sellId)
            if (!sell) {
                return res.status(404).json({message: "فرۆشتن نەدۆزرایەوە"})
            }
            const productInSell = sell.products.find(product => product.productStorageId === selectedProduct.productStorageId)
            if (productInSell.quantity < quantity) {
                return res.status(400).json({message: "بڕی پێویست بەردەست نییە بۆ گەڕاندنەوە"});
            }
            const dbProductStorage = await ProductStorage.findByPk(selectedProduct.productStorageId)
            if (!dbProductStorage) {
                return res.status(404).json({message: "مەخزەن نەدۆزرایەوە"})
            }
            dbProductStorage.quantity += parseInt(quantity)
            await dbProductStorage.save()
            sell.products = sell.products.map(product => {
                if (product.productStorageId === selectedProduct.productStorageId) {
                    return {...product, quantity: product.quantity - quantity}
                } else {
                    return product
                }
            })
            sell.totalPrice -= (sell.currency === "$" ? productInSell.product.boxPriceUSD : productInSell.product.boxPriceIQD) * quantity
            await sell.save()
            return res.json({message: "داواکاری گەڕاندنەوە بە سەرکەوتوویی تەواوبوو"})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    });
