const router = require("../../config/express")
const {Product, ProductInvoice, Retailer} = require("../../models")
const {body, param} = require("express-validator")
const fs = require('fs')
const path = require('path')
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation")
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
const IMAGE_DIR = path.join(__dirname, '../', '../', 'images', 'product-invoices')


router.post("/warehouse/product-invoice", requirePermissions([permissionMap.addProduct]), body("barcode").notEmpty().custom(async barcode => {
    const product = await Product.findByPk(barcode)
    if (!product) {
        throw new Error('Product is not found')
    }
}), body("retailerId").isInt().custom(async retailerId => {
    const retailer = await Retailer.findByPk(retailerId)
    if (!retailer) {
        throw new Error('Retailer is not found')
    }
}), body("invoiceNumber").isInt(), body("quantity").isInt(), body("price").isFloat(), body("currency").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const productInvoice = req.body
    try {
        if (productInvoice.image) {
            const fileExtension = productInvoice.image.split(';')[0].split('/')[1]
            const base64Data = productInvoice.image.replace(/^data:image\/\w+;base64,/, "")
            const filename = new Date().getTime() + "." + fileExtension
            const filepath = path.join(IMAGE_DIR, filename)
            try {
                await fs.writeFileSync(filepath, base64Data, 'base64')
            } catch (e) {
                console.error(e)
                return res.status(500).send('Error saving image')
            }
            const dbProduct = await ProductInvoice.create({
                ...productInvoice, image: filename
            })
            return res.json(dbProduct)
        } else {
            const dbProduct = await ProductInvoice.create({
                ...productInvoice, image: "no-image.png"
            })
            return res.json(dbProduct)
        }

    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.put("/warehouse/product-invoice", requirePermissions([permissionMap.addProduct]), body("productInvoiceId").notEmpty().custom(async productInvoiceId => {
    const productInvoice = await ProductInvoice.findByPk(productInvoiceId)
    if (!productInvoice) {
        throw new Error('Product Invoice is not found')
    }
}), body("barcode").notEmpty().custom(async barcode => {
    const product = await Product.findByPk(barcode)
    if (!product) {
        throw new Error('Product is not found')
    }
}), body("retailerId").isInt().custom(async retailerId => {
    const retailer = await Retailer.findByPk(retailerId)
    if (!retailer) {
        throw new Error('Retailer is not found')
    }
}), body("invoiceNumber").isInt(), body("quantity").isInt(), body("price").isFloat(), body("currency").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const productInvoice = req.body
    try {
        if (productInvoice.image) {
            const fileExtension = productInvoice.image.split(';')[0].split('/')[1]
            const base64Data = productInvoice.image.replace(/^data:image\/\w+;base64,/, "")
            const filename = new Date().getTime() + "." + fileExtension
            const filepath = path.join(IMAGE_DIR, filename)
            try {
                await fs.writeFileSync(filepath, base64Data, 'base64')
            } catch (e) {
                console.error(e)
                return res.status(500).send('Error saving image')
            }
            const dbProduct = await ProductInvoice.update({
                ...productInvoice, image: filename
            }, {
                where: {
                    productInvoiceId: productInvoice.productInvoiceId
                }
            })
            return res.json(dbProduct)
        } else {
            const dbProduct = await ProductInvoice.update({
                ...productInvoice, image: "no-image.png"
            }, {
                where: {
                    productInvoiceId: productInvoice.productInvoiceId
                }
            })
            return res.json(dbProduct)
        }

    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/warehouse/product-invoices", requirePermissions([permissionMap.productsView]), async (req, res) => {
    try {
        const productInvoices = await ProductInvoice.findAll()
        return res.json(productInvoices.sort((a, b) => (a.productInvoiceId < b.productInvoiceId ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/warehouse/product-invoices/:productInvoiceId", requirePermissions([permissionMap.productsView]), param("productInvoiceId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {productInvoiceId} = req.params
    try {
        const productInvoices = await ProductInvoice.findAll({where: {productInvoiceId}})
        return res.json(productInvoices)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.delete("/warehouse/product-invoice/:productInvoiceId", requirePermissions([permissionMap.addProduct]), param("productInvoiceId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {productInvoiceId} = req.params
    try {
        const invoice = await ProductInvoice.findByPk(productInvoiceId)
        if (!invoice) {
            return res.status(400).json({message: "ئەو بەشە بوونی نییە"})
        }
        await invoice.destroy()
        return res.json({message: "بەش سڕایەوە بە سەرکەوتوویی"})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})