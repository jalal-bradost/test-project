const router = require("../../config/express")
const {body, param} = require("express-validator")
const {
    Product,
    Storage,
    Category,
    ProductInvoice,
    ProductStorage,
    ProductionCompany,
    Retailer
} = require("../../models")
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation")
const fs = require('fs')
const path = require('path')
const {systemCategoryId, systemPermission} = require("./pharmacyConstants");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
const IMAGE_DIR = path.join(__dirname, '../', '../', 'images', 'products')

router.post("/pharmacy/product", requirePermissions(systemPermission), body("barcode").notEmpty().custom(async barcode => {
    const product = await Product.findByPk(barcode)
    if (product) {
        throw new Error('Barcode is already used')
    }
}), body("name").trim().notEmpty(), body("threshold").isInt(), body("perBox").isInt(), body("productionCompanyId").isInt().custom(async productionCompanyId => {
    const productionCompany = await ProductionCompany.findByPk(productionCompanyId)
    if (!productionCompany) {
        throw new Error('ProductionCompany is not found')
    }
}), body("expireThreshold").isInt(), body("boxPriceUSD").isFloat(), body("specialPriceUSD").isFloat(), body("categoryId").isInt().custom(async categoryId => {
    const category = await Category.findByPk(categoryId)
    if (!category) {
        throw new Error('There is no such category')
    }
}), returnInCaseOfInvalidation, async (req, res) => {
    const product = req.body
    try {
        if (product.image) {
            const fileExtension = product.image.split(';')[0].split('/')[1]
            const base64Data = product.image.replace(/^data:image\/\w+;base64,/, "")
            const filename = `${product.barcode}.${fileExtension}`
            const filepath = path.join(IMAGE_DIR, filename)

            try {
                fs.writeFileSync(filepath, base64Data, 'base64')
            } catch (e) {
                console.error(e)
                return res.status(500).send('Error saving image')
            }
            const dbProduct = await Product.create({
                ...product, image: filename, systemCategoryId
            })
            return res.json(dbProduct)
        } else {
            const dbProduct = await Product.create({
                ...product, image: "no-image.png", systemCategoryId
            })
            return res.json(dbProduct)
        }

    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/pharmacy/products", async (req, res) => {
    try {
        const products = await Product.findAll({
            where: {systemCategoryId},
            include: [{
                model: ProductInvoice, include: [{
                    model: Retailer
                }]
            }, {
                model: ProductStorage, include: [{
                    model: Storage
                }]
            }, {
                model: ProductionCompany
            }, {model: Category}]
        })
        return res.json(products.sort((a, b) => (a.createdAt.getTime() > b.createdAt.getTime() ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/pharmacy/product/:barcode", requirePermissions(systemPermission), param("barcode").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const barcode = req.params.barcode
    try {
        const product = await Product.findByPk(barcode, {
            include: [{
                model: ProductInvoice, include: [{
                    model: Retailer
                }]
            }, {
                model: ProductStorage, include: [{
                    model: Storage
                }]
            }, {
                model: ProductionCompany
            }, {model: Category}]
        })
        if (!product || product.systemCategoryId !== systemCategoryId) {
            return res.status(404).json({message: "ئەم باڕکۆدە داخل نەکراوە"})
        }
        return res.json(product)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.put("/pharmacy/product", requirePermissions(systemPermission), body("barcode").notEmpty().custom(async barcode => {
    const product = await Product.findByPk(barcode)
    if (!product || product.systemCategoryId !== systemCategoryId) {
        throw new Error('Product is not found')
    }
}), body("name").trim().notEmpty(), body("productionCompanyId").isInt().custom(async productionCompanyId => {
    const productionCompany = await ProductionCompany.findByPk(productionCompanyId)
    if (!productionCompany) {
        throw new Error('ProductionCompany is not found')
    }
}), body("threshold").isInt(), body("perBox").isInt(), body("expireThreshold").isInt(), body("boxPriceUSD").isFloat(), body("specialPriceUSD").isFloat(), body("categoryId").isInt().custom(async categoryId => {
    const category = await Category.findByPk(categoryId)
    if (!category) {
        throw new Error('There is no such category')
    }
}), returnInCaseOfInvalidation, async (req, res) => {
    const product = req.body
    try {
        if (product.image) {
            if (!product.image.startsWith("data")) {
                delete product.image
            } else {
                const fileExtension = product.image.split(';')[0].split('/')[1]
                const base64Data = product.image.replace(/^data:image\/\w+;base64,/, "")
                const filename = `${product.barcode}.${fileExtension}`
                const filepath = path.join(IMAGE_DIR, filename)

                try {
                    fs.writeFileSync(filepath, base64Data, 'base64')
                } catch (e) {
                    console.error(e)
                    return res.status(500).send('Error saving image')
                }
                product.image = filename
            }
        }
        await Product.update(product, {
            where: {
                barcode: product.barcode
            }
        })
        const dbProduct = await Product.findByPk(product.barcode, {
            include: [{
                model: ProductInvoice,
            }, {
                model: ProductStorage,
            }]
        })
        const dbProductStorages = dbProduct.ProductStorages
        const dbProductInvoices = dbProduct.ProductInvoices
        // remove deleted
        // for (const dbProductStorage of dbProductStorages) {
        //     if (!product.ProductStorages.find(productStorage => productStorage.productStorageId === dbProductStorage.productStorageId)) {
        //         await dbProductStorage.destroy()
        //     }
        // }
        for (const dbProductInvoice of dbProductInvoices) {
            if (!product.ProductInvoices.find(productInvoice => productInvoice.productInvoiceId === dbProductInvoice.productInvoiceId)) {
                await dbProductInvoice.destroy()
            }
        }
        // update existing
        for (const productStorage of product.ProductStorages) {
            const dbProductStorage = dbProductStorages.find(dbProductStorage => dbProductStorage.productStorageId === productStorage.productStorageId)
            if (dbProductStorage) {
                await dbProductStorage.update({quantity: productStorage.quantity})
            }
        }
        for (const productInvoice of product.ProductInvoices) {
            const dbProductInvoice = dbProductInvoices.find(dbProductInvoice => dbProductInvoice.productInvoiceId === productInvoice.productInvoiceId)
            if (dbProductInvoice) {
                await dbProductInvoice.update(productInvoice)
            } else {
                await ProductInvoice.create({
                    ...productInvoice, barcode: product.barcode
                })
            }
        }
        return res.json(dbProduct)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.delete("/pharmacy/product/:barcode", requirePermissions(systemPermission), param("barcode").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const {barcode} = req.params
    try {
        const product = await Product.findByPk(barcode)
        if (!product || product.systemCategoryId !== systemCategoryId) {
            return res.status(400).json({message: "ئەو پڕۆدەکتە بوونی نییە"})
        }
        await product.destroy()
        return res.json({message: "پڕۆدەکت سڕایەوە بە سەرکەوتوویی"})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.put("/pharmacy/product/:barcode/special-price",
           requirePermissions([permissionMap.pharmacist]),
           param("barcode").notEmpty().custom(async barcode => {
               const product = await Product.findOne({where: {barcode, systemCategoryId}})
               if (!product) {
                   throw new Error('Product is not found')
               }
           }),
           body("specialPriceUSD").isFloat(),
           returnInCaseOfInvalidation,
           async (req, res) => {
               const {specialPriceUSD} = req.body
               const {barcode} = req.params
               try {
                   await Product.update({specialPriceUSD}, {
                       where: {
                           barcode: barcode
                       }
                   })
                   return res.json({message: "Special price updated"})
               } catch (e) {
                   console.log(e)
                   return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
               }
           })