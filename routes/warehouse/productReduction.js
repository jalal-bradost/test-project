const {ProductReduction, Product, ProductStorage, Storage, sequelize} = require('../../models');
const router = require("../../config/express")
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");
const {body, param} = require("express-validator");
const isAuthenticated = require("../../middlware/isAuthenticatedMiddleware");
const types = [
    {
        key: "warehouse",
        permission: 22
    },
    {
        key: "icu",
        permission: 23
    },
    {
        key: "sw",
        permission: 24
    },
    {
        key: "op",
        permission: 25
    },
    {
        key: "perfusion",
        permission: 46
    },
    {
        key: "anesthesia",
        permission: 47
    },
    {
        key: "scrubNurse",
        permission: 48
    },
    {
        key: "pharmacy",
        permission: 26
    }
]
const typeKeys = types.map(type => type.key)

function hasTypePermission(user, type) {
    const userPermissions = user.Role?.permissions || [];
    if (userPermissions.includes(0)) return true;
    const typePermission = types.find(t => t.key === type)?.permission
    if (!typePermission) return false
    return userPermissions.includes(typePermission)
}

router.post("/:type/product-reduction", isAuthenticated, [
    body("productStorageId").isInt(),
    param("type").isIn(typeKeys),
    body("date").isISO8601().toDate(),
    body("quantity").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    const {productStorageId, quantity, note, date} = req.body;
    const {type} = req.params
    if (!hasTypePermission(req.user, type)) {
        return res.status(403).json({message: "You don't have permission to do this"})
    }
    try {
        await sequelize.transaction(async (t) => {
            const productStorage = await ProductStorage.findByPk(productStorageId)
            if (!productStorage) {
                throw new Error("Product storage not found")
            }
            if (productStorage.quantity < quantity) {
                throw new Error("Not enough quantity")
            }
            productStorage.quantity -= quantity
            await productStorage.save({transaction: t})
            await ProductReduction.create({
                date,
                barcode: productStorage.barcode,
                productStorageId,
                quantity,
                expireDate: productStorage.expireDate,
                productionDate: productStorage.productionDate,
                storageId: productStorage.storageId,
                type,
                note
            }, {transaction: t})
            return res.json({message: "Product reduction created"})
        })
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.get("/:type/product-reductions",
    isAuthenticated,
    param("type").isIn(typeKeys),
    async (req, res) => {
        const {type} = req.params
        if (!hasTypePermission(req.user, type)) {
            return res.status(403).json({message: "You don't have permission to access this"})
        }
        try {
            const productReductions = await ProductReduction.findAll({
                where: {
                    type
                },
                include: [
                    {model: Product},
                    {model: Storage}
                ]
            })
            res.json(productReductions)
        } catch (e) {
            res.status(500).json({message: e.message});
        }
    });

router.get("/product-reductions",
    requirePermissions([permissionMap.warehouseProductReduction]),
    async (req, res) => {
        try {
            const productReductions = await ProductReduction.findAll({
                include: [
                    {model: Product},
                    {model: Storage}
                ]
            })
            res.json(productReductions)
        } catch (e) {
            res.status(500).json({message: e.message});
        }
    });

router.delete("/:type/product-reduction/:productReductionId",
    isAuthenticated,
    param("type").isIn(typeKeys),
    async (req, res) => {
        const {productReductionId, type} = req.params
        if (!hasTypePermission(req.user, type)) {
            return res.status(403).json({message: "You don't have permission to do this"})
        }
        try {
            await sequelize.transaction(async (t) => {
                const productReduction = await ProductReduction.findOne({where: {productReductionId, type}})
                if (!productReduction) {
                    return res.status(404).json({message: "Product reduction not found"})
                }
                const storage = await Storage.findByPk(productReduction.storageId)
                if (!storage) {
                    return res.status(404).json({message: "Storage not found"})
                }
                const productStorage = await ProductStorage.findOne({
                    where: {
                        barcode: productReduction.barcode,
                        storageId: productReduction.storageId,
                        expireDate: productReduction.expireDate,
                        productionDate: productReduction.productionDate
                    }
                })
                if (!productStorage) {
                    await ProductStorage.create({
                        barcode: productReduction.barcode,
                        storageId: productReduction.storageId,
                        expireDate: productReduction.expireDate,
                        productionDate: productReduction.productionDate,
                        quantity: productReduction.quantity
                    }, {transaction: t})
                } else {
                    await productStorage.update({quantity: productStorage.quantity + parseInt(productReduction.quantity)},
                        {transaction: t})
                }
                await productReduction.destroy({transaction: t})
                return res.json({message: "Product reduction deleted"})
            })
        } catch (e) {
            res.status(500).json({message: e.message});
        }
    });