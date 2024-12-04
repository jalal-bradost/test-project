const router = require("../../config/express")
const {body, validationResult, param} = require("express-validator")
const {Category} = require("../../models")
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation")
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
router.post("/warehouse/category", requirePermissions([permissionMap.warehouseProperties]), body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const {name} = req.body
    const result = validationResult(req)
    if (!result.isEmpty()) {
        return res.status(400).json(result.array())
    }
    try {
        const category = await Category.create({name})
        return res.json(category)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})
router.put("/warehouse/category", requirePermissions([permissionMap.warehouseProperties]), body("categoryId").isInt().custom(async categoryId => {
    const category = await Category.findByPk(categoryId)
    if (!category) {
        throw new Error('Category is not found')
    }
}), body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const {name, categoryId} = req.body
    try {
        await Category.update({name}, {where: {categoryId}})
        return res.json({name, categoryId})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/warehouse/category/:categoryId", requirePermissions([permissionMap.warehouseProperties]), param("categoryId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {categoryId} = req.params
    try {
        const category = await Category.findByPk(categoryId)
        if (!category) {
            return res.status(400).json({message: "ئەو بەشە بوونی نییە"})
        }
        return res.json(category)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.delete("/warehouse/category/:categoryId", requirePermissions([permissionMap.warehouseProperties]), param("categoryId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {categoryId} = req.params
    try {
        // const category = await Category.findByPk(categoryId)
        // if (!category) {
        //     return res.status(400).json({message: "ئەو بەشە بوونی نییە"})
        // }
        // await category.destroy()
        return res.json({message: "بەش سڕایەوە بە سەرکەوتوویی"})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})
router.get("/warehouse/categories", requirePermissions([permissionMap.warehouseProperties]), async (req, res) => {
    try {
        const categories = await Category.findAll()
        return res.json(categories.sort((a, b) => (a.categoryId < b.categoryId ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})
