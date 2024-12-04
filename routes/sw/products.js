const router = require("../../config/express")
const {
    Product, Storage, Category, ProductStorage, ProductionCompany,
} = require("../../models")
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
router.get("/sw/products", requirePermissions([permissionMap.surgicalWardItems]), async (req, res) => {
    try {
        const products = await Product.findAll({
                                                   include: [
                                                       {
                                                           model: ProductStorage,
                                                           where: {storageId: 11},
                                                           include: [{model: Storage}]
                                                       }, {model: ProductionCompany}, {model: Category}
                                                   ]
                                               })
        return res.json(products.sort((a, b) => (a.createdAt.getTime() > b.createdAt.getTime() ? -1 : 1)))
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
    }
})
