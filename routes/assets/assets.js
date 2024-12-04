const router = require("../../config/express")
const {body, param} = require("express-validator")
const {Asset, AssetCategory, sequelize, AssetParent} = require("../../models")
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation")
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
const sharp = require("sharp");
const path = require("path");
const {randomInRange} = require("../../utils/numberUtils");
const IMAGE_DIR = path.join(__dirname, '../', '../', 'images', 'assets')

router.post("/assets", requirePermissions([permissionMap.assets]), [
    body("name").isString(),
    body("note").optional().isString(),
    body("assets").isArray(),
    body("assets.*.name").isString(),
    body("assets.*.quantity").isInt(),
    body("assets.*.price").isNumeric(),
    body("assets.*.custodian").isString(),
    body("assets.*.customId").optional().notEmpty(),
    body("assets.*.note").optional().isString(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        await sequelize.transaction(async (t) => {
            const assetParent = await AssetParent.create({
                                                             name: req.body.name, notes: req.body.notes,
                                                         }, {transaction: t})
            const assets = req.body.assets.map(asset => ({
                ...asset, assetParentId: assetParent.assetParentId
            }))
            for (const asset of assets) {
                if (!asset.image) {
                    await Asset.create(asset, {transaction: t})
                    continue
                }
                const fileExtension = asset.image.split(';')[0].split('/')[1]
                const base64Data = asset.image.replace(/^data:image\/\w+;base64,/, "");
                const filename = `${new Date().getTime()}${randomInRange(1, 1000)}.${fileExtension}`;
                const filepath = path.join(IMAGE_DIR, filename);
                try {
                    const imageBuffer = Buffer.from(base64Data, 'base64');
                    await sharp(imageBuffer).resize(500, 500, {fit: 'inside', withoutEnlargement: false}).toFile(
                        filepath);
                    await Asset.create({...asset, image: filename}, {transaction: t})
                } catch (e) {
                    console.error(e);
                    return res.status(500).send('Error processing image');
                }

            }
            res.json({message: "Assets created successfully"})
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
})

router.put("/assets/:assetParentId", requirePermissions([permissionMap.assets]), [
    body("name").isString(), body("note").optional().isString(), param("assetParentId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const {name, note} = req.body
        const assetParentId = req.params.assetParentId
        const assetParent = await AssetParent.findByPk(assetParentId)
        if (!assetParent) {
            return res.status(404).json({message: "Asset parent not found"})
        }
        await assetParent.update({name, note})
        res.json({message: "Asset parent updated successfully"})
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
})
router.post("/assets/:assetParentId/asset", requirePermissions([permissionMap.assets]), [
    body("name").isString(),
    body("quantity").isInt(),
    body("price").isNumeric(),
    body("custodian").isString(),
    body("customId").optional().notEmpty(),
    body("note").optional().isString(),
    param("assetParentId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const {name, quantity, custodian, customId, note, price, image} = req.body
        const assetParentId = req.params.assetParentId
        const assetParent = await AssetParent.findByPk(assetParentId)
        if (!assetParent) {
            return res.status(404).json({message: "Asset parent not found"})
        }
        let imagePath = null
        if (image) {
            const fileExtension = image.split(';')[0].split('/')[1]
            const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
            const filename = `${new Date().getTime()}${randomInRange(1, 1000)}.${fileExtension}`;
            const filepath = path.join(IMAGE_DIR, filename);
            try {
                const imageBuffer = Buffer.from(base64Data, 'base64');
                await sharp(imageBuffer).resize(500, 500, {fit: 'inside', withoutEnlargement: false}).toFile(filepath);
                imagePath = filename
            } catch (e) {
                console.error(e);
                return res.status(500).send('Error processing image');
            }
        }
        const newAsset = await Asset.create({
                                                assetParentId,
                                                name,
                                                quantity,
                                                custodian,
                                                customId,
                                                note,
                                                price,
                                                image: imagePath
                                            })
        return res.json(newAsset)
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
})
router.put("/assets/asset/:assetId", requirePermissions([permissionMap.assets]), [
    body("name").isString(),
    body("quantity").isInt(),
    body("price").isNumeric(),
    body("custodian").isString(),
    body("customId").optional().notEmpty(),
    body("note").optional().isString(),
    param("assetId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const {name, quantity, custodian, customId, note, image, price} = req.body
        const assetId = req.params.assetId
        const asset = await Asset.findByPk(assetId)
        if (!asset) {
            return res.status(404).json({message: "Asset not found"})
        }
        let imagePath = asset.image
        if (image === null) {
            imagePath = null
        } else if (image.startsWith("data:image")) {
            const fileExtension = image.split(';')[0].split('/')[1]
            const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
            const filename = `${new Date().getTime()}${randomInRange(1, 1000)}.${fileExtension}`;
            const filepath = path.join(IMAGE_DIR, filename);
            try {
                const imageBuffer = Buffer.from(base64Data, 'base64');
                await sharp(imageBuffer).resize(500, 500, {fit: 'inside', withoutEnlargement: false}).toFile(filepath);
                imagePath = filename
            } catch (e) {
                console.error(e);
                return res.status(500).send('Error processing image');
            }
        }
        await asset.update({name, quantity, custodian, customId, note, price, image: imagePath})
        res.json({message: "Asset updated successfully"})
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
})

router.delete("/assets/asset/:assetId", requirePermissions([permissionMap.assets]), [
    param("assetId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const assetId = req.params.assetId
        const asset = await Asset.findByPk(assetId)
        if (!asset) {
            return res.status(404).json({message: "Asset not found"})
        }
        await asset.destroy()
        res.json({message: "Asset deleted successfully"})
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
})

router.delete("/assets/:assetParentId", requirePermissions([permissionMap.assets]), [
    param("assetParentId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const assetParentId = req.params.assetParentId
        const assetParent = await AssetParent.findByPk(assetParentId)
        if (!assetParent) {
            return res.status(404).json({message: "Asset parent not found"})
        }
        await assetParent.destroy()
        res.json({message: "Asset parent deleted successfully"})
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
})

router.get("/assets", requirePermissions([permissionMap.assets]), async (req, res) => {
    try {
        const assetParents = await AssetParent.findAll({
                                                           include: [
                                                               {
                                                                   model: Asset,
                                                               }
                                                           ]
                                                       })
        res.json(assetParents)
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
})

router.get("/assets/:assetParentId", requirePermissions([permissionMap.assets]), [
    param("assetParentId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const assetParentId = req.params.assetParentId
        const assetParent = await AssetParent.findByPk(assetParentId, {
            include: [
                {
                    model: Asset,
                }
            ]
        })
        if (!assetParent) {
            return res.status(404).json({message: "Asset parent not found"})
        }
        res.json(assetParent)
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
})