const router = require("../../config/express")
const {body, param} = require("express-validator")
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation")
const {ProductStorage, Product} = require("../../models")
const {systemCategoryId, systemPermission} = require("./pharmacyConstants");
const requirePermissions = require("../../middlware/requirePermissions");
router.post("/pharmacy/product-storage", requirePermissions(systemPermission), body("barcode").notEmpty().custom(async barcode => {
    const product = await Product.findByPk(barcode)
    if (!product || product.categoryId === systemCategoryId) {
        throw new Error('Product is not found')
    }
}), body("expireDate").isISO8601().toDate(), body("productionDate").isISO8601().toDate(), body("quantity").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const productStorage = req.body
    try {
        const dbProductStorage = await ProductStorage.create(productStorage)
        return res.json(dbProductStorage)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})
router.put("/pharmacy/product-storage", requirePermissions(systemPermission), body("productStorageId").isInt().custom(async productStorageId => {
    const productStorage = await ProductStorage.findByPk(productStorageId)
    if (!productStorage) {
        throw new Error('Product Storage is not found')
    }
}) , body("barcode").notEmpty().custom(async barcode => {
    const product = await Product.findByPk(barcode)
    if (!product || product.categoryId === systemCategoryId) {
        throw new Error('Product is not found')
    }
}), body("expireDate").isISO8601().toDate(), body("productionDate").isISO8601().toDate(), body("quantity").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const productStorage = req.body
    try {
        const dbProductStorage = await ProductStorage.update(productStorage, {
            where: {
                productStorageId: productStorage.productStorageId
            }
        })
        return res.json(dbProductStorage)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/pharmacy/product-storages", requirePermissions(systemPermission), async (req, res) => {
    try {
        const productStorages = await ProductStorage.findAll()
        return res.json(productStorages.sort((a, b) => (a.productStorageId < b.productStorageId ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

// router.delete("/pharmacy/product-storage/:productStorageId", param("productStorageId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
//     const {productStorageId} = req.params
//     try {
//         const storage = await ProductStorage.findByPk(productStorageId)
//         if (!storage) {
//             return res.status(400).json({message: "ئەو بەشە بوونی نییە"})
//         }
//         await storage.destroy()
//         return res.json({message: "بەش سڕایەوە بە سەرکەوتوویی"})
//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
//     }
// })