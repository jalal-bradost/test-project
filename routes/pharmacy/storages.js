const router = require("../../config/express")
const {body, validationResult, param} = require("express-validator")
const {Storage, ProductStorage} = require("../../models")
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation")
const {systemCategoryId, systemPermission} = require("./pharmacyConstants");
const requirePermissions = require("../../middlware/requirePermissions");
router.post("/pharmacy/storage",
            requirePermissions(systemPermission),
            body("name").notEmpty(),
            returnInCaseOfInvalidation,
            async (req, res) => {
                const {name} = req.body
                const result = validationResult(req)
                if (!result.isEmpty()) {
                    return res.status(400).json(result.array())
                }
                try {
                    const storage = await Storage.create({name, systemCategoryId})
                    return res.json(storage)
                } catch (e) {
                    console.log(e)
                    return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
                }
            })
router.put("/pharmacy/storage",
           requirePermissions(systemPermission),
           body("storageId").isInt().custom(async storageId => {
               const storage = await Storage.findByPk(storageId)
               if (!storage || storage.systemCategoryId !== systemCategoryId) {
                   throw new Error('Storage is not found')
               }
           }),
           body("name").notEmpty(),
           returnInCaseOfInvalidation,
           async (req, res) => {
               const {name, storageId} = req.body
               try {
                   const storage = await Storage.update({name}, {where: {storageId}})
                   return res.json(storage)
               } catch (e) {
                   console.log(e)
                   return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
               }
           })

router.get("/pharmacy/storages", requirePermissions(systemPermission), async (req, res) => {
    try {
        const storages = await Storage.findAll({where: {systemCategoryId}})
        return res.json(storages.sort((a, b) => (a.storageId < b.storageId ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/pharmacy/storages/transfer", requirePermissions(systemPermission), async (req, res) => {
    try {
        const storages = await Storage.findAll()
        return res.json(storages.sort((a, b) => (a.storageId < b.storageId ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})

router.get("/pharmacy/storages/items", requirePermissions(systemPermission), async (req, res) => {
    try {
        const storages = await Storage.findAll({where: {systemCategoryId}, include: [{model: ProductStorage}]})
        return res.json(storages.sort((a, b) => (a.storageId < b.storageId ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})


router.delete("/pharmacy/storage/:storageId",
              requirePermissions(systemPermission),
              param("storageId").isInt(),
              returnInCaseOfInvalidation,
              async (req, res) => {
                  const {storageId} = req.params
                  try {
                      // const storage = await Storage.findByPk(storageId)
                      // if (!storage || storage.systemCategoryId !== systemCategoryId) {
                      //     return res.status(400).json({message: "ئەو بەشە بوونی نییە"})
                      // }
                      // await storage.destroy()
                      return res.json({message: "بەش سڕایەوە بە سەرکەوتوویی"})
                  } catch (e) {
                      console.log(e)
                      return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
                  }
              })