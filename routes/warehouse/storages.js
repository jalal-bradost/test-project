const router = require("../../config/express")
const {body, validationResult, param} = require("express-validator")
const {Storage, ProductStorage} = require("../../models")
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation")
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
router.post("/warehouse/storage", requirePermissions([permissionMap.warehouseProperties]), body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const {name} = req.body
    const result = validationResult(req)
    if (!result.isEmpty()) {
        return res.status(400).json(result.array())
    }
    try {
        const storage = await Storage.create({name})
        return res.json(storage)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})
router.put("/warehouse/storage", requirePermissions([permissionMap.warehouseProperties]), body("storageId").isInt().custom(async storageId => {
    const storage = await Storage.findByPk(storageId)
    if (!storage) {
        throw new Error('Storage is not found')
    }
}), body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const {name, storageId} = req.body
    try {
        const storage = await Storage.update({name}, {where: {storageId}})
        return res.json(storage)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/warehouse/storage/:storageId", requirePermissions([permissionMap.warehouseProperties]), param("storageId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {storageId} = req.params
    try {
        const storage = await Storage.findByPk(storageId)
        if(!storage){
            return res.status(400).json({message: "ئەو بەشە بوونی نییە"})
        }
        return res.json(storage)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})
router.get("/warehouse/storages", requirePermissions([permissionMap.warehouseProperties]), async (req, res) => {
    try {
        const storages = await Storage.findAll()
        return res.json(storages.sort((a, b) => (a.storageId < b.storageId ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/warehouse/storages/items", requirePermissions([permissionMap.warehouseProperties]), async (req, res) => {
    try {
        const storages = await Storage.findAll({include: [{model: ProductStorage}]})
        return res.json(storages.sort((a, b) => (a.storageId < b.storageId ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})


router.delete("/warehouse/storage/:storageId", requirePermissions([permissionMap.warehouseProperties]), param("storageId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {storageId} = req.params
    try {
        // const storage = await Storage.findByPk(storageId)
        // if(!storage){
        //     return res.status(400).json({message: "ئەو بەشە بوونی نییە"})
        // }
        // await storage.destroy()
        return res.json({message: "بەش سڕایەوە بە سەرکەوتوویی"})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})