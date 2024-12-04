const router = require("../../config/express")
const {body, param} = require("express-validator")
const {Retailer} = require("../../models")
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation")
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
router.post("/warehouse/retailer", requirePermissions([permissionMap.warehouseProperties]), body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const {name, email,  phoneNumber, note} = req.body
    try {
        const retailer = await Retailer.create({name, note, phoneNumber, email})
        return res.json(retailer)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})
router.put("/warehouse/retailer", requirePermissions([permissionMap.warehouseProperties]), body("retailerId").isInt().custom(async retailerId => {
    const retailer = await Retailer.findByPk(retailerId)
    if (!retailer) {
        throw new Error('Retailer is not found')
    }
}), body("name").notEmpty(), returnInCaseOfInvalidation, async (req, res) => {
    const {name, phoneNumber, note, retailerId, email} = req.body
    try {
        const retailer = await Retailer.update({name, phoneNumber, note, email}, {where: {retailerId}})
        return res.json(retailer)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/warehouse/retailer/:retailerId", requirePermissions([permissionMap.warehouseProperties]), param("retailerId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {retailerId} = req.params
    try {
        const retailer = await Retailer.findByPk(retailerId)
        if(!retailer){
            return res.status(400).json({message: "ئەو بەشە بوونی نییە"})
        }
        return res.json(retailer)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})
router.get("/warehouse/retailers", requirePermissions([permissionMap.warehouseProperties]), async (req, res) => {
    try {
        const retailers = await Retailer.findAll()
        return res.json(retailers.sort((a, b) => (a.retailerId < b.retailerId ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})


router.delete("/warehouse/retailer/:retailerId", requirePermissions([permissionMap.warehouseProperties]), param("retailerId").isInt(), returnInCaseOfInvalidation, async (req, res) => {
    const {retailerId} = req.params
    try {
        // const retailer = await Retailer.findByPk(retailerId)
        // if(!retailer){
        //     return res.status(400).json({message: "ئەو بەشە بوونی نییە"})
        // }
        // await retailer.destroy()
        return res.json({message: "بەش سڕایەوە بە سەرکەوتوویی"})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})