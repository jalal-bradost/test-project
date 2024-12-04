const router = require("../../config/express")
const {body, param} = require("express-validator")
const {Buy, ProductInvoice, ProductStorage, Retailer, BuyDebt, Product, Storage} = require("../../models")
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation")
const fs = require('fs')
const path = require('path')
const {systemCategoryId, systemPermission} = require("./pharmacyConstants");
const IMAGE_DIR = path.join(__dirname, '../', '../', 'images', 'buys')
const requirePermissions = require("../../middlware/requirePermissions")
if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR)
}

router.post("/pharmacy/buy", requirePermissions(systemPermission),
    body("products.*.product.barcode").notEmpty().custom(async barcode => {
        const product = await Product.findByPk(barcode)
        if (!product) {
            throw new Error('Product is not found')
        }
    }),
    body("products.*.productionDate").isISO8601().toDate(),
    body("paymentType").notEmpty(),
    body("products.*.expireDate").isISO8601().toDate(),
    body("products.*.storageId").isInt().custom(async storageId => {
        const storage = await Storage.findByPk(storageId)
        if (!storage) {
            throw new Error('Storage is not found')
        }
    }),
    body("products.*.quantity").isInt(),
    body("invoiceNumber").notEmpty(),
    body("products.*.price").isFloat(),
    body("totalPrice").isFloat(),
    body("currency").notEmpty(),
    body("date").isISO8601().toDate(),
    body("retailerId").isInt().custom(async retailerId => {
        const retailer = await Retailer.findByPk(retailerId)
        if (!retailer) {
            throw new Error('Retailer is not found')
        }
    }), body("invoiceNumber").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
        const buy = req.body
        try {
            // Save buy image if exists
            if (buy.image) {
                const fileExtension = buy.image.split(';')[0].split('/')[1]
                const base64Data = buy.image.replace(/^data:image\/\w+;base64,/, "")
                const filename = `${buy.invoiceNumber}.${fileExtension}`
                const filepath = path.join(IMAGE_DIR, filename)

                try {
                    await fs.writeFileSync(filepath, base64Data, 'base64')
                    buy.image = filename
                } catch (e) {
                    console.error(e)
                    return res.status(500).send('Error saving image')
                }
            }

            // Iterate over products to save details in ProductInvoice and ProductStorage
            for (const product of buy.products) {
                const dbProductInvoice = await ProductInvoice.create({
                    barcode: product.product.barcode,
                    invoiceNumber: buy.invoiceNumber,
                    image: buy.image || "no-image.png",
                    quantity: product.quantity,
                    price: product.price,
                    currency: buy.currency,
                    retailerId: buy.retailerId
                })
                const dbProductStorage = await ProductStorage.create({
                    barcode: product.product.barcode,
                    expireDate: product.expireDate,
                    productionDate: product.productionDate,
                    quantity: product.quantity,
                    storageId: product.storageId
                })
                product.productInvoiceId = dbProductInvoice.productInvoiceId
                product.productStorageId = dbProductStorage.productStorageId
            }
            let newBuy = await Buy.create({...buy, systemCategoryId});
            if (buy.paymentType === 'debt') {
                await BuyDebt.create({
                    buyId: newBuy.buyId, paidAmount: 0
                })
            }
            return res.json(newBuy)
        } catch (e) {
            console.error(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    })

// router.get("/pharmacy/buy/:buyId", async (req, res) => {
//     const buyId = req.params.buyId
//     try {
//         const buy = await Buy.findByPk(buyId)
//         if (!buy) {
//             return res.status(404).json({message: "Buy not found"})
//         }
//         return res.json(buy)
//     } catch (e) {
//         console.error(e)
//         return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
//     }
// })

router.get("/pharmacy/buys", requirePermissions(systemPermission), async (req, res) => {
    try {
        const buys = await Buy.findAll({
            where: {
                systemCategoryId
            },
            include: [{
                model: Retailer,
            }, {
                model: BuyDebt,
                required: false
            }]
        });
        return res.json(buys.sort((a, b) => (a.buyId < b.buyId ? 1 : -1)))
    } catch (e) {
        console.error(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.delete("/pharmacy/buy/:buyId", requirePermissions(systemPermission), param("buyId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    try {
        const buy = await Buy.findOne({
            where: {
                buyId: req.params.buyId,
                systemCategoryId
            }
        })
        for (const product of buy.products) {
            await ProductInvoice.destroy({where: {productInvoiceId: product.productInvoiceId}})
            await ProductStorage.destroy({where: {productStorageId: product.productStorageId}})
        }
        await buy.destroy()
        return res.json({message: "کڕین سڕایەوە بە سەرکەوتوویی"})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
});
router.post("/pharmacy/buy-refund", requirePermissions(systemPermission),
    body("buyId").isInt(),
    body("quantity").isInt(),
    body("selectedProduct.productStorageId").isInt(),

    returnInCaseOfInvalidation,
    async (req, res) => {
        const {selectedProduct, quantity, buyId} = req.body
        if (quantity % selectedProduct.product.perBox !== 0) {
            return res.status(400).json({message: "هەڵەیەک هەیە لە ڕێژەی بۆکس"})
        }
        try {
            const productStorage = await ProductStorage.findByPk(selectedProduct.productStorageId)
            if (!productStorage) {
                return res.status(404).json({message: "ئەم پڕۆدەکتە لە مەخزەن نەدۆزرایەوە"})
            }
            let isDeleted = false
            if (productStorage.quantity < quantity) {
                return res.status(400).json({message: "بڕی پێویست بەردەست نییە"})
            } else if (productStorage.quantity === quantity) {
                await productStorage.destroy()
                await ProductInvoice.destroy({where: {productInvoiceId: selectedProduct.productInvoiceId}})
                isDeleted = true;
            }
            const totalRefundedPrice = (quantity / selectedProduct.product.perBox || 1) * selectedProduct.price
            const buy = await Buy.findOne({where: {buyId, systemCategoryId}})
            if (!buy) {
                return res.status(404).json({message: "کڕین نەدۆزرایەوە"})
            }
            if (isDeleted) {
                buy.products = buy.products.filter(product => product.productStorageId !== selectedProduct.productStorageId)
            } else {
                buy.products = buy.products.map(product => {
                    let pQuantity = product.quantity;
                    if (product.productStorageId === selectedProduct.productStorageId) {
                        pQuantity -= quantity
                    }
                    return {...product, quantity: pQuantity}
                });
                productStorage.quantity -= quantity
                await productStorage.save()
                await ProductInvoice.update({quantity: productStorage.quantity / selectedProduct.product.perBox}, {where: {productInvoiceId: selectedProduct.productInvoiceId}})
            }
            buy.totalPrice -= totalRefundedPrice
            await buy.save()
            return res.json({message: "داواکاری گەڕاندنەوە بە سەرکەوتوویی تەواوبوو"})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    });