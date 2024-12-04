const router = require("../../config/express")
const {body, validationResult, param} = require("express-validator")
const {ProductionCompany} = require("../../models")
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation")
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
router.post("/warehouse/production-company", requirePermissions([permissionMap.warehouseProperties]), body("name").notEmpty(), body("country").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {name, country} = req.body
    const result = validationResult(req)
    if (!result.isEmpty()) {
        return res.status(400).json(result.array())
    }
    try {
        const productionCompany = await ProductionCompany.create({name, country})
        return res.json(productionCompany)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})
router.put("/warehouse/production-company", requirePermissions([permissionMap.warehouseProperties]), body("productionCompanyId").isInt().custom(async productionCompanyId => {
    const productionCompany = await ProductionCompany.findByPk(productionCompanyId)
    if (!productionCompany) {
        throw new Error('ProductionCompany is not found')
    }
}), body("name").notEmpty(), body("country").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {name, country, productionCompanyId} = req.body
    try {
        const productionCompany = await ProductionCompany.update({name, country}, {where: {productionCompanyId}})
        return res.json(productionCompany)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/warehouse/production-company/:productionCompanyId", requirePermissions([permissionMap.warehouseProperties]), param("productionCompanyId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {productionCompanyId} = req.params
    try {
        const productionCompany = await ProductionCompany.findByPk(productionCompanyId)
        if(!productionCompany){
            return res.status(400).json({message: "ئەو بەشە بوونی نییە"})
        }
        return res.json(productionCompany)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})
router.get("/warehouse/production-companies", requirePermissions([permissionMap.warehouseProperties]), async (req, res) => {
    try {
        const productionCompanies = await ProductionCompany.findAll()
        return res.json(productionCompanies.sort((a, b) => (a.productionCompanyId < b.productionCompanyId ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})


router.delete("/warehouse/production-company/:productionCompanyId", requirePermissions([permissionMap.warehouseProperties]), param("productionCompanyId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {productionCompanyId} = req.params
    try {
        const productionCompany = await ProductionCompany.findByPk(productionCompanyId)
        if(!productionCompany){
            return res.status(400).json({message: "ئەو بەشە بوونی نییە"})
        }
        await productionCompany.destroy()
        return res.json({message: "بەش سڕایەوە بە سەرکەوتوویی"})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})