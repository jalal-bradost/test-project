const router = require("../../config/express")
const {body, param} = require("express-validator")
const {OrderProduct, sequelize, Order} = require("../../models")
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation")
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
const sharp = require("sharp");
const path = require("path");
const {randomInRange} = require("../../utils/numberUtils");
const IMAGE_DIR = path.join(__dirname, '../', '../', 'images', 'orders')

router.post("/warehouse/orders", requirePermissions([permissionMap.buyProduct]), [
    body("name").notEmpty(),
    body("products").isArray(),
    body("products.*.name").isString(),
    body("products.*.quantity").isInt(),
    body("products.*.price").isFloat(),
    body("products.*.code").isString(),
    body("products.*.size").isString(),
    body("products.*.note").optional().isString(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const {name, note, products} = req.body
        await sequelize.transaction(async (t) => {
            const order = await Order.create({name, note}, {transaction: t})
            const mappedProducts = products.map(currentProduct => ({
                ...currentProduct, orderId: order.orderId
            }))
            for (const product of mappedProducts) {
                if (!product.image) {
                    await OrderProduct.create(product, {transaction: t})
                    continue
                }
                const fileExtension = product.image.split(';')[0].split('/')[1]
                const base64Data = product.image.replace(/^data:image\/\w+;base64,/, "");
                const filename = `${new Date().getTime()}${randomInRange(1, 1000)}.${fileExtension}`;
                const filepath = path.join(IMAGE_DIR, filename);
                try {
                    const imageBuffer = Buffer.from(base64Data, 'base64');
                    await sharp(imageBuffer).resize(500, 500, {fit: 'inside', withoutEnlargement: false}).toFile(
                        filepath);
                    await OrderProduct.create({...product, image: filename}, {transaction: t})
                } catch (e) {
                    console.error(e);
                    return res.status(500).send('Error processing image');
                }
            }
            res.json({message: "Orders created successfully"})
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
})

router.post("/warehouse/orders/:orderId/products", requirePermissions([permissionMap.buyProduct]), [
    body("name").isString(),
    body("quantity").isInt(),
    body("price").isFloat(),
    body("code").isString(),
    body("size").isString(),
    param("orderId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const {name, quantity, code, size, note, image} = req.body
        const orderId = req.params.orderId
        const order = await Order.findByPk(orderId)
        if (!order) {
            return res.status(404).json({message: "Order not found"})
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
        const newOrderProduct = await OrderProduct.create({
            orderId,
            name,
            quantity,
            code,
            size,
            note,
            image: imagePath
        })
        return res.json(newOrderProduct)
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
})
router.put("/warehouse/orders/products/:orderProductId", requirePermissions([permissionMap.buyProduct]), [
    body("name").isString(),
    body("quantity").isInt(),
    body("price").isFloat(),
    body("code").isString(),
    body("size").isString(),
    body("note").optional().isString(),
    param("orderProductId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const {name, quantity, code, size, note, image} = req.body
        const orderProductId = req.params.orderProductId
        const order = await OrderProduct.findByPk(orderProductId)
        if (!order) {
            return res.status(404).json({message: "Order not found"})
        }
        let imagePath = order.image
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
        await order.update({name, quantity, code, size, note, image: imagePath})
        res.json({message: "Order updated successfully"})
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
})

router.delete("/warehouse/orders/products/:orderProductId", requirePermissions([permissionMap.buyProduct]), [
    param("orderProductId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const orderProductId = req.params.orderProductId
        const order = await OrderProduct.findByPk(orderProductId)
        if (!order) {
            return res.status(404).json({message: "Order not found"})
        }
        await order.destroy()
        res.json({message: "Order deleted successfully"})
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
})

router.delete("/warehouse/orders/:orderId", requirePermissions([permissionMap.buyProduct]), [
    param("orderId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const orderId = req.params.orderId
        const order = await Order.findByPk(orderId)
        if (!order) {
            return res.status(404).json({message: "Order not found"})
        }
        await order.destroy()
        res.json({message: "Order deleted successfully"})
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
})

router.get("/warehouse/orders", requirePermissions([permissionMap.buyProduct]), async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: OrderProduct,
                }
            ]
        })
        res.json(orders.sort((a, b) => b.orderId - a.orderId));
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
})

router.get("/warehouse/orders/:orderId", requirePermissions([permissionMap.buyProduct]), [
    param("orderId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const orderId = req.params.orderId
        const order = await Order.findByPk(orderId, {
            include: [
                {
                    model: OrderProduct,
                }
            ]
        })
        if (!order) {
            return res.status(404).json({message: "Order not found"})
        }
        res.json(order)
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
})

router.put("/warehouse/orders/:orderId/:orderProductId", requirePermissions([permissionMap.buyProduct]), [
    param("orderId").isInt(),
    param("orderProductId").isInt(),
    body("isArrived").isBoolean(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const orderProductId = req.params.orderProductId
        const orderProduct = await OrderProduct.findByPk(orderProductId)
        if (!orderProduct) {
            return res.status(404).json({message: "Order Product not found"})
        }
        await orderProduct.update({isArrived: req.body.isArrived})
        res.json({message: "Order Product updated successfully"})
    } catch (e) {
        console.log(e)
        res.status(500).json({message: "Something went wrong"})
    }
});