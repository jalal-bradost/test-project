const router = require("../../config/express")
const {body, param} = require("express-validator")
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation")
const {ProductStorage, Product} = require("../../models")
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
router.post("/warehouse/product-storage", requirePermissions([permissionMap.addProduct]), body("barcode").notEmpty().custom(async barcode => {
    const product = await Product.findByPk(barcode)
    if (!product) {
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
router.put("/warehouse/product-storage", requirePermissions([permissionMap.addProduct]), body("productStorageId").isInt().custom(async productStorageId => {
    const productStorage = await ProductStorage.findByPk(productStorageId)
    if (!productStorage) {
        throw new Error('Product Storage is not found')
    }
}), body("barcode").notEmpty().custom(async barcode => {
    const product = await Product.findByPk(barcode)
    if (!product) {
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

router.get("/warehouse/product-storage/:productStorageId", requirePermissions([permissionMap.productsView]), param("productStorageId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {productStorageId} = req.params
    try {
        const productStorage = await ProductStorage.findByPk(productStorageId)
        if (!productStorage) {
            return res.status(400).json({message: "بوونی نییە"})
        }
        return res.json(productStorage)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/warehouse/product-storages", requirePermissions([permissionMap.productsView]), async (req, res) => {
    try {
        const productStorages = await ProductStorage.findAll()
        return res.json(productStorages.sort((a, b) => (a.productStorageId < b.productStorageId ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.delete("/warehouse/product-storage/:productStorageId", requirePermissions([permissionMap.addProduct, permissionMap.surgeryItems]), param("productStorageId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {productStorageId} = req.params
    try {
        const storage = await ProductStorage.findByPk(productStorageId)
        if (!storage) {
            return res.status(400).json({message: "Storage not found"})
        }
        if (storage.quantity > 0) {
            return res.status(400).json({message: "Storage cannot be deleted as it has products attached to it"})
        }
        await storage.destroy()
        return res.json({message: "Storage deleted successfully"})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})