const router = require("../../config/express")
const {body, param} = require("express-validator")
const {Customer} = require("../../models")
const returnInCaseOfInvalidation = require("../../middlware/returnInCaseOfInvalidation")
const fs = require('fs')
const path = require('path')
const requirePermissions = require("../../middlware/requirePermissions");
const permissionMap = require("../../utils/permissionMap");
const IMAGE_DIR = path.join(__dirname, '../', '../', 'images', 'customers')

// Validators for Customer input
const customerValidators = [
    body("name").trim().notEmpty(),
    body("debtThreshold").isFloat(),
    body("phoneNumber").notEmpty(),
]

// POST - Create a new customer with image management
router.post("/warehouse/customer", requirePermissions([permissionMap.warehouseProperties]),
    customerValidators,
    returnInCaseOfInvalidation,
    async (req, res) => {
        const customer = req.body
        try {
            if (customer.image) {
                const fileExtension = customer.image.split(';')[0].split('/')[1]
                const base64Data = customer.image.replace(/^data:image\/\w+;base64,/, "")
                const filename = `${Date.now()}.${fileExtension}` // using timestamp for unique filenames
                const filepath = path.join(IMAGE_DIR, filename)

                await fs.promises.writeFile(filepath, base64Data, 'base64')
                customer.image = filename
            } else {
                customer.image = "no-image.png"
            }

            const dbCustomer = await Customer.create(customer)
            return res.json(dbCustomer)
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "Server Error"})
        }
    }
)

// GET - Fetch a specific customer by customerId
router.get('/warehouse/customer/:customerId', requirePermissions([permissionMap.warehouseProperties]),
    param('customerId').isInt().withMessage('Customer ID should be an integer'),
    returnInCaseOfInvalidation,
    async (req, res) => {
        try {
            const customer = await Customer.findByPk(req.params.customerId)
            if (!customer) {
                return res.status(404).json({message: "Customer not found"})
            }
            return res.json(customer)
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "Server Error"})
        }
    }
)

router.get("/warehouse/customers", requirePermissions([permissionMap.warehouseProperties]), async (req, res) => {
        try {
            const customers = await Customer.findAll()
            return res.json(customers.sort((a, b) => (a.customerId < b.customerId ? -1 : 1)))
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "Server Error"})
        }
    }
)

// PUT - Update a customer with image management
router.put("/warehouse/customer", requirePermissions([permissionMap.warehouseProperties]),
    customerValidators,
    returnInCaseOfInvalidation,
    async (req, res) => {
        const customer = req.body
        if(!customer.customerId){
            return res.status(404).json({message: "کڕیار نەدۆزرایەوە"})
        }
        try {
            if (customer.image) {
                if (!customer.image.startsWith("data")) {
                    delete customer.image
                } else {
                    const fileExtension = customer.image.split(';')[0].split('/')[1]
                    const base64Data = customer.image.replace(/^data:image\/\w+;base64,/, "")
                    const filename = `${customer.customerId}.${fileExtension}`
                    const filepath = path.join(IMAGE_DIR, filename)

                    try {
                        fs.writeFileSync(filepath, base64Data, 'base64')
                    } catch (e) {
                        console.error(e)
                        return res.status(500).send('هەڵەیەک ڕوویدا لەکاتی هەڵگرتنی وێنە')
                    }
                    customer.image = filename
                }
            }

            const updated = await Customer.update(customer, {
                where: {customerId: customer.customerId}
            })

            if (updated[0] === 0) {
                return res.status(404).json({message: "کڕیار نەدۆزرایەوە"})
            }

            return res.json({message: "کڕیار نوێکرایەوە بەسەرکەوتوویی"})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "هەڵەیەک ڕوویدا لە سێرڤەر"})
        }
    }
)

// DELETE - Remove a customer
router.delete("/warehouse/customer/:customerId", requirePermissions([permissionMap.warehouseProperties]),
    param('customerId').isInt().withMessage('Customer ID should be an integer'),
    returnInCaseOfInvalidation,
    async (req, res) => {
        try {
            // const customer = await Customer.findByPk(req.params.customerId)
            // if (!customer) {
            //     return res.status(404).json({message: "Customer not found"})
            // }
            // await customer.destroy()
            return res.json({message: "Customer deleted successfully"})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "Server Error"})
        }
    }
)

module.exports = router
