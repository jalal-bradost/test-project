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
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
const isAuthenticated = require("../../middlware/isAuthenticatedMiddleware");
const {DataTypes} = require("sequelize");
const IMAGE_DIR = path.join(__dirname, '../', '../', 'images', 'products')
const systemCategoryId = 1;
router.post("/warehouse/product",
    requirePermissions([permissionMap.addProduct]),
    body("barcode").notEmpty().custom(async barcode => {
        const product = await Product.findByPk(barcode)
        if (product) {
            throw new Error('Barcode is already used')
        }
    }),
    body("name").trim().notEmpty(),
    body("threshold").isInt(),
    body("perBox").isInt(),
    body("productionCompanyId").isInt().custom(async productionCompanyId => {
        const productionCompany = await ProductionCompany.findByPk(productionCompanyId)
        if (!productionCompany) {
            throw new Error('ProductionCompany is not found')
        }
    }),
    body("expireThreshold").isInt(),
    body("boxPriceUSD").isFloat(),
    body("specialPriceUSD").isFloat(),
    body("productType").isString(),
    body("categoryId").isInt().custom(async categoryId => {
        const category = await Category.findByPk(categoryId)
        if (!category) {
            throw new Error('There is no such category')
        }
    }),
    returnInCaseOfInvalidation,
    async (req, res) => {
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
                    ...product, image: filename
                })
                return res.json(dbProduct)
            } else {
                console.log({
                    ...product, image: "no-image.png"
                })
                const dbProduct = await Product.create({
                    ...product, image: "no-image.png"
                })
                return res.json(dbProduct)
            }

        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    })

router.get("/warehouse/products", isAuthenticated, async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                {
                    model: ProductInvoice, include: [
                        {
                            model: Retailer
                        }
                    ]
                }, {
                    model: ProductStorage, include: [
                        {
                            model: Storage
                        }
                    ]
                }, {
                    model: ProductionCompany
                }, {model: Category}
            ],
            where: {
                systemCategoryId
            }
        })
        return res.json(products.sort((a, b) => (a.createdAt.getTime() > b.createdAt.getTime() ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})


router.get("/shar-warehouse/products/thresholds", requirePermissions([permissionMap.sharWarehouse]), async (req, res) => {
    try {
        const storageIds = [21, 17, 7, 8, 9, 10, 11];
        const products = await Product.findAll({
            include: [
                {
                    model: ProductInvoice, include: [
                        {
                            model: Retailer
                        }
                    ]
                }, {
                    model: ProductStorage, include: [
                        {
                            model: Storage
                        }
                    ], where: {
                        storageId: storageIds
                    }
                }, {
                    model: ProductionCompany
                }, {model: Category}
            ],
            where: {
                systemCategoryId
            }
        })
        return res.json(products.sort((a, b) => (a.createdAt.getTime() > b.createdAt.getTime() ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/shar-warehouse/products", requirePermissions([permissionMap.sharWarehouse]), async (req, res) => {
    try {
        const storageId = 21;
        const products = await Product.findAll({
            include: [
                {
                    model: ProductInvoice, include: [
                        {
                            model: Retailer
                        }
                    ]
                }, {
                    model: ProductStorage, include: [
                        {
                            model: Storage
                        }
                    ], where: {
                        storageId
                    }
                }, {
                    model: ProductionCompany
                }, {model: Category}
            ],
            where: {
                systemCategoryId
            }
        })
        return res.json(products.sort((a, b) => (a.createdAt.getTime() > b.createdAt.getTime() ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/warehouse/product/:barcode",
    requirePermissions([permissionMap.productsView]),
    param("barcode").notEmpty(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const barcode = req.params.barcode
        try {
            const product = await Product.findByPk(barcode, {
                include: [
                    {
                        model: ProductInvoice, include: [
                            {
                                model: Retailer
                            }
                        ]
                    }, {
                        model: ProductStorage, include: [
                            {
                                model: Storage
                            }
                        ]
                    }, {
                        model: ProductionCompany
                    }, {model: Category}
                ]
            })
            if (!product) {
                return res.status(404).json({message: "ئەم باڕکۆدە داخل نەکراوە"})
            }
            return res.json(product)
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    })

router.put("/warehouse/product",
    requirePermissions([permissionMap.addProduct]),
    body("barcode").notEmpty().custom(async barcode => {
        const product = await Product.findByPk(barcode)
        if (!product) {
            throw new Error('Product is not found')
        }
    }),
    body("name").trim().notEmpty(),
    body("productionCompanyId").isInt().custom(async productionCompanyId => {
        const productionCompany = await ProductionCompany.findByPk(productionCompanyId)
        if (!productionCompany) {
            throw new Error('ProductionCompany is not found')
        }
    }),
    body("threshold").isInt(),
    body("perBox").isInt(),
    body("productType").isString(),
    body("expireThreshold").isInt(),
    body("boxPriceUSD").isFloat(),
    body("specialPriceUSD").isFloat(),
    body("categoryId").isInt().custom(async categoryId => {
        const category = await Category.findByPk(categoryId)
        if (!category) {
            throw new Error('There is no such category')
        }
    }),
    returnInCaseOfInvalidation,
    async (req, res) => {
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
                include: [
                    {
                        model: ProductInvoice,
                    }, {
                        model: ProductStorage,
                    }
                ]
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

router.put("/warehouse/product/:barcode/special-price",
    requirePermissions([permissionMap.addProduct]),
    param("barcode").notEmpty().custom(async barcode => {
        const product = await Product.findByPk(barcode)
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

router.delete("/warehouse/product/:barcode",
    requirePermissions([permissionMap.addProduct]),
    param("barcode").notEmpty(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {barcode} = req.params
        try {
            const product = await Product.findByPk(barcode)
            if (!product) {
                return res.status(400).json({message: "ئەو پڕۆدەکتە بوونی نییە"})
            }
            await product.destroy()
            return res.json({message: "پڕۆدەکت سڕایەوە بە سەرکەوتوویی"})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    })

router.put("/:type/product/:barcode/threshold",
    requirePermissions([permissionMap.addProduct, permissionMap.icuItems, permissionMap.surgicalWardItems, permissionMap.surgeryItems, permissionMap.picuItems]),
    param("barcode").notEmpty().custom(async barcode => {
        const product = await Product.findByPk(barcode)
        if (!product) {
            throw new Error('Product is not found')
        }
    }),
    param("type").isIn(["picu", "icu", "op", "perfusion", "anesthesia", "scrubNurse", "sw", "warehouse", "pharmacy", "cardiology"]),
    body("threshold").isInt(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {threshold} = req.body
        const {barcode, type} = req.params
        try {
            const accessor = type === "warehouse" || type === "pharmacy" ? "threshold" : `${type}Threshold`
            await Product.update({[accessor]: threshold}, {
                where: {
                    barcode: barcode
                }
            })
            return res.json({message: "Threshold updated"})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    })

router.put("/:type/product/:barcode/minimum",
    requirePermissions([permissionMap.icuItems, permissionMap.surgicalWardItems, permissionMap.surgeryItems, permissionMap.picuItems]),
    param("barcode").notEmpty().custom(async barcode => {
        const product = await Product.findByPk(barcode)
        if (!product) {
            throw new Error('Product is not found')
        }
    }),
    param("type").isIn(["picu", "icu", "op", "sw", "perfusion", "anesthesia", "scrubNurse", "cardiology"]),
    body("minimum").isInt(),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {minimum} = req.body
        const {barcode, type} = req.params
        try {
            const accessor = `${type}Minimum`
            await Product.update({[accessor]: minimum}, {
                where: {
                    barcode
                }
            })
            return res.json({message: "Minimum updated"})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    })

router.put(
    "/warehouse/product/:barcode/quantity/:storageId",
    requirePermissions([
        permissionMap.addProduct
    ]),
    param("barcode").notEmpty().custom(async (barcode) => {
        const product = await Product.findByPk(barcode);
        if (!product) {
            throw new Error("Product is not found");
        }
        return true;
    }),
    param("storageId").isIn([7, 8, 9, 10, 11, 17,29]),
    body("quantity").isInt({min: 1}).withMessage("Quantity must be a positive integer"),
    returnInCaseOfInvalidation,
    async (req, res) => {
        const {quantity} = req.body;
        const {barcode, storageId} = req.params;
        try {
            const productStorages = await ProductStorage.findAll({
                where: {
                    barcode,
                    storageId,
                },
            });
            const totalQuantity = productStorages.reduce((acc, productStorage) => acc + productStorage.quantity, 0);
            if (productStorages.length === 0) {
                await ProductStorage.create({
                    barcode,
                    storageId,
                    quantity,
                    expireDate: new Date(), // Consider adding a default expiration date or setting it based on the product
                    productionDate: new Date(), // Consider adding a default production date or setting it based on the product
                });
            } else if (totalQuantity < quantity) {
                productStorages[0].quantity = quantity;
                await productStorages[0].save();
            } else if (totalQuantity > quantity) {
                let remainingQuantity = totalQuantity - quantity;
                for (const productStorage of productStorages) {
                    if (remainingQuantity >= productStorage.quantity) {
                        remainingQuantity -= productStorage.quantity;
                        await productStorage.destroy();
                    } else {
                        productStorage.quantity -= remainingQuantity;
                        await productStorage.save();
                        break;
                    }
                }
            }
            return res.json({message: "Quantity updated"});
        } catch (e) {
            console.error(e);
            return res.status(500).json({message: "An error occurred on the server"});
        }
    }
);