const router = require("../../config/express");
const {body, param} = require("express-validator");
const {
    DepartmentOrderProduct,
    sequelize,
    DepartmentOrder,
    DepartmentOrderLog,
    User,
    Employee, OrderChat, OrderChatSeen
} = require("../../models");
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
const sharp = require("sharp");
const path = require("path");
const {randomInRange} = require("../../utils/numberUtils");
const {orderDepartments, orderStatus, orderTypes} = require("./orderProperties");
const {notifyOrderCreation, notifyOrderStatusChange} = require("../../services/smsService");
const IMAGE_DIR = path.join(__dirname, '../', '../', 'images', 'orders');
const orderPermissions = [permissionMap.icuOrder, permissionMap.picuOrder, permissionMap.opOrder, permissionMap.swOrder, permissionMap.research]
router.post("/department/orders", requirePermissions(orderPermissions), [
    body("departmentId").isInt(),
    body("type").isInt(),
    body("deadline").optional().isISO8601().toDate(),
    body("note").optional().isString(),
    body("products").isArray(),
    body("products.*.name").isString(),
    body("products.*.quantity").isInt(),
    body("products.*.code").isString(),
    body("products.*.size").isString(),
    body("products.*.price").isFloat(),
    body("products.*.note").optional().isString(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const {departmentId, type, note, products, deadline} = req.body;
        const {userId} = req.user;
        await sequelize.transaction(async (t) => {
            const order = await DepartmentOrder.create({departmentId, type, note, deadline, userId}, {transaction: t});
            const mappedProducts = products.map(currentProduct => ({
                ...currentProduct, orderId: order.orderId
            }));
            for (const product of mappedProducts) {
                if (!product.image) {
                    await DepartmentOrderProduct.create(product, {transaction: t});
                    continue;
                }
                const fileExtension = product.image.split(';')[0].split('/')[1];
                const base64Data = product.image.replace(/^data:image\/\w+;base64,/, "");
                const filename = `${new Date().getTime()}${randomInRange(1, 1000)}.${fileExtension}`;
                const filepath = path.join(IMAGE_DIR, filename);
                try {
                    const imageBuffer = Buffer.from(base64Data, 'base64');
                    await sharp(imageBuffer).resize(500, 500, {
                        fit: 'inside',
                        withoutEnlargement: false
                    }).toFile(filepath);
                    await DepartmentOrderProduct.create({...product, image: filename}, {transaction: t});
                } catch (e) {
                    console.error(e);
                    return res.status(500).send('Error processing image');
                }
            }
            await notifyOrderCreation(req.user, departmentId, type);
            res.json({message: "Orders created successfully"});
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({message: "Something went wrong"});
    }
});

router.post("/department/orders/:orderId/products", requirePermissions(orderPermissions), [
    body("name").isString(),
    body("quantity").isInt(),
    body("code").isString(),
    body("size").isString(),
    body("price").isFloat(),
    param("orderId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const {name, quantity, code, price, barcode, size, note, image} = req.body;
        const orderId = req.params.orderId;
        const order = await DepartmentOrder.findByPk(orderId);
        if (!order) {
            return res.status(404).json({message: "Order not found"});
        }
        let imagePath = null;
        if (image) {
            const fileExtension = image.split(';')[0].split('/')[1];
            const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
            const filename = `${new Date().getTime()}${randomInRange(1, 1000)}.${fileExtension}`;
            const filepath = path.join(IMAGE_DIR, filename);
            try {
                const imageBuffer = Buffer.from(base64Data, 'base64');
                await sharp(imageBuffer).resize(500, 500, {fit: 'inside', withoutEnlargement: false}).toFile(filepath);
                imagePath = filename;
            } catch (e) {
                console.error(e);
                return res.status(500).send('Error processing image');
            }
        }
        const newOrderProduct = await DepartmentOrderProduct.create({
            orderId,
            name,
            quantity,
            code,
            barcode,
            size,
            price,
            note,
            image: imagePath
        });
        return res.json(newOrderProduct);
    } catch (e) {
        console.log(e);
        res.status(500).json({message: "Something went wrong"});
    }
});

router.put("/department/orders/products/:orderProductId", requirePermissions(orderPermissions), [
    body("name").isString(),
    body("quantity").isInt(),
    body("code").isString(),
    body("size").isString(),
    body("price").isFloat(),
    body("note").optional().isString(),
    param("orderProductId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const {name, quantity, code, size, barcode, price, note, image} = req.body;
        const orderProductId = req.params.orderProductId;
        const order = await DepartmentOrderProduct.findByPk(orderProductId);
        if (!order) {
            return res.status(404).json({message: "Order not found"});
        }
        let imagePath = order.image;
        if (image === null) {
            imagePath = null;
        } else if (image.startsWith("data:image")) {
            const fileExtension = image.split(';')[0].split('/')[1];
            const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
            const filename = `${new Date().getTime()}${randomInRange(1, 1000)}.${fileExtension}`;
            const filepath = path.join(IMAGE_DIR, filename);
            try {
                const imageBuffer = Buffer.from(base64Data, 'base64');
                await sharp(imageBuffer).resize(500, 500, {fit: 'inside', withoutEnlargement: false}).toFile(filepath);
                imagePath = filename;
            } catch (e) {
                console.error(e);
                return res.status(500).send('Error processing image');
            }
        }
        await order.update({name, quantity, code, barcode, price, size, note, image: imagePath});
        res.json({message: "Order updated successfully"});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: "Something went wrong"});
    }
});

router.delete("/department/orders/products/:orderProductId", requirePermissions(orderPermissions), [
    param("orderProductId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const orderProductId = req.params.orderProductId;
        const order = await DepartmentOrderProduct.findByPk(orderProductId);
        if (!order) {
            return res.status(404).json({message: "Order not found"});
        }
        if (order.status > 0) {
            return res.status(400).json({message: "Updated order cannot be cancelled."})
        }
        await order.destroy();
        res.json({message: "Order deleted successfully"});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: "Something went wrong"});
    }
});

router.delete("/department/orders/:orderId", requirePermissions([permissionMap.icuOrder, permissionMap.picuOrder, permissionMap.opOrder, permissionMap.swOrder]), [
    param("orderId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await DepartmentOrder.findByPk(orderId);
        if (!order) {
            return res.status(404).json({message: "Order not found"});
        }
        await order.destroy();
        res.json({message: "Order deleted successfully"});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: "Something went wrong"});
    }
});

router.get("/department/hr/orders", requirePermissions([permissionMap.humanResources]), async (req, res) => returnOrders({
    req,
    res,
    departmentId: Object.values(orderDepartments),
    status: Object.values(orderStatus),
    type: Object.values(orderTypes)
}));

router.get("/department/icu/orders", requirePermissions([permissionMap.icuOrder]), async (req, res) => returnOrders({
    req,
    res,
    departmentId: orderDepartments.ICU,
    status: Object.values(orderStatus),
    type: Object.values(orderTypes)
}));

router.get("/department/picu/orders", requirePermissions([permissionMap.picuOrder]), async (req, res) => returnOrders({
    req,
    res,
    departmentId: orderDepartments.PICU,
    status: Object.values(orderStatus),
    type: Object.values(orderTypes)
}));

router.get("/department/sw/orders", requirePermissions([permissionMap.swOrder]), async (req, res) => returnOrders({
    req,
    res,
    departmentId: orderDepartments.SW,
    status: Object.values(orderStatus),
    type: Object.values(orderTypes)
}));

router.get("/department/op/orders", requirePermissions([permissionMap.opOrder]), async (req, res) => returnOrders({
    req,
    res,
    departmentId: orderDepartments.OP,
    status: Object.values(orderStatus),
    type: Object.values(orderTypes)
}));

router.get("/department/perfusion/orders", requirePermissions([permissionMap.perfusionOrder]), async (req, res) => returnOrders({
    req,
    res,
    departmentId: orderDepartments.PERFUSION,
    status: Object.values(orderStatus),
    type: Object.values(orderTypes)
}));

router.get("/department/scrub-nurse/orders", requirePermissions([permissionMap.scrubNurseOrder]), async (req, res) => returnOrders({
    req,
    res,
    departmentId: orderDepartments.SCRUB_NURSE,
    status: Object.values(orderStatus),
    type: Object.values(orderTypes)
}));

router.get("/department/anesthesia/orders", requirePermissions([permissionMap.anesthesiaOrder]), async (req, res) => returnOrders({
    req,
    res,
    departmentId: orderDepartments.ANESTHESIA,
    status: Object.values(orderStatus),
    type: Object.values(orderTypes)
}));


router.get("/department/research/orders", requirePermissions([permissionMap.research]), async (req, res) => returnOrders({
    req,
    res,
    departmentId: orderDepartments.RESEARCH,
    status: Object.values(orderStatus),
    type: Object.values(orderTypes)
}));

router.get("/department/warehouse/orders", requirePermissions([permissionMap.buyProduct, permissionMap.sharWarehouse]), async (req, res) => returnOrders({
    req,
    res,
    departmentId: Object.values(orderDepartments),
    status: [orderStatus.PENDING_DELIVERY, orderStatus.WAITING_FOR_WAREHOUSE, orderStatus.COMPLETED, orderStatus.REJECTED_BY_WAREHOUSE],
    type: [orderTypes.DISPOSABLE, orderTypes.EQUIPMENT]
}));

router.get("/department/maintenance/orders", requirePermissions([permissionMap.maintenance]), async (req, res) => returnOrders({
    req,
    res,
    departmentId: Object.values(orderDepartments),
    status: [orderStatus.PENDING_DELIVERY, orderStatus.WAITING_FOR_WAREHOUSE, orderStatus.COMPLETED, orderStatus.REJECTED_BY_WAREHOUSE],
    type: [orderTypes.DEVICES]
}));

router.get("/department/pharmacy/orders", requirePermissions([permissionMap.pharmacist]), async (req, res) => returnOrders({
    req,
    res,
    departmentId: Object.values(orderDepartments),
    status: [orderStatus.PENDING_DELIVERY, orderStatus.WAITING_FOR_WAREHOUSE, orderStatus.COMPLETED, orderStatus.REJECTED_BY_WAREHOUSE],
    type: orderTypes.DRUG
}));


const {Op, literal, fn, col} = require('sequelize');

const returnOrders = async ({req, res, departmentId, type, status}) => {
    try {
        const orders = await DepartmentOrder.findAll({
            include: [
                {
                    model: DepartmentOrderProduct,
                },
                {
                    model: DepartmentOrderLog,
                    include: [
                        {
                            model: User
                        }
                    ]
                },
                {
                    model: OrderChat,
                    as: 'chats',
                    include: [
                        {
                            model: OrderChatSeen,
                            as: 'seenBy'
                        }
                    ]
                }
            ],
            where: {
                departmentId,
                type,
                status,
            }
        });

        const ordersWithNewMessages = orders.map(order => {
            const hasNewMessages = order.chats.some(chat =>
                chat.userId !== req.user.userId &&
                !chat.seenBy.some(seen => seen.userId === req.user.userId)
            );

            const orderJSON = order.toJSON();
            delete orderJSON.chats; // Remove the chats data from the response

            return {
                ...orderJSON,
                hasNewMessages
            };
        });

        return res.json(ordersWithNewMessages.sort((a, b) => b.orderId - a.orderId));
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "Something went wrong"});
    }
};


router.put("/department/orders/:orderId/status", requirePermissions([permissionMap.humanResources, permissionMap.sharWarehouse, permissionMap.buyProduct, permissionMap.pharmacist, permissionMap.maintenance]), [
    param("orderId").isInt(),
    body("status").isInt(),
    body("reason").optional().isString()
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const {status, reason} = req.body;
        const order = await DepartmentOrder.findByPk(orderId, {
            include: [{
                model: User,
                as: "user",
                include: {model: Employee, as: "employee"}
            }]
        });
        if (!order) {
            return res.status(404).json({message: "Order not found"});
        }
        await DepartmentOrderLog.create({orderId, status, reason, userId: req.user.userId});
        await order.update({status, reason});
        await notifyOrderStatusChange(order, status, reason);
        if (status === orderStatus.WAITING_FOR_WAREHOUSE) {
            if (order.type === orderTypes.DRUG) {
                await notifyOrderCreation(order.user, order.departmentId, order.type, permissionMap.pharmacist);
            } else if (order.type === orderTypes.EQUIPMENT || order.type === orderTypes.DISPOSABLE) {
                await notifyOrderCreation(order.user, order.departmentId, order.type, permissionMap.buyProduct);
            } else if (order.type === orderTypes.DEVICES) {
                await notifyOrderCreation(order.user, order.departmentId, order.type, permissionMap.maintenance);
            }
        }
        res.json({message: "Order updated successfully"});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: "Something went wrong"});
    }
});

router.get("/department/orders/:orderId", requirePermissions([...orderPermissions, permissionMap.pharmacist, permissionMap.maintenance, permissionMap.humanResources, permissionMap.buyProduct]), [
    param("orderId").isInt(),
], returnInCaseOfInvalidation, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await DepartmentOrder.findByPk(orderId, {
            include: [
                {
                    model: DepartmentOrderProduct,
                }
            ]
        });
        if (!order) {
            return res.status(404).json({message: "Order not found"});
        }
        res.json(order);
    } catch (e) {
        console.log(e);
        res.status(500).json({message: "Something went wrong"});
    }
});