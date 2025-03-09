require('dotenv').config()
const app = require("./config/express")
const {initializeDB} = require("./lib/db")
const {checkProductsOnStorages} = require("./services/notificationService")
const {checkTasks} = require("./services/taskService")
initializeDB().then(() => {
    console.log("Database initialized")
    checkProductsOnStorages().then().catch((e) => {
        console.log(e)
    });
    checkTasks().then().catch((e) => {
        console.log(e)
    });
}).catch((e) => {
    console.log(e)
    process.exit(1);
})
 

const PORT = process.env.PORT || 5050
const VERSION = "1.2.2"

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} on version ${VERSION}`)
})

app.keepAliveTimeout = 300000; // Default is 5 seconds
app.headersTimeout = 310000; // Headers timeout should be slightly higher than keepAliveTimeout
app.timeout = 1 * 1000 * 60 * 60 * 24; // 1 hour
// services
require("./services/backupService")

// general routes
require("./routes/images")
require("./routes/audios")
require("./routes/files")
require("./routes/auth")
require("./routes/settings")
require("./routes/users")
require("./routes/roles")

// warehouse routes
require("./routes/warehouse/products")
require("./routes/warehouse/categories")
require("./routes/warehouse/storages")
require("./routes/warehouse/productInvoices")
require("./routes/warehouse/productStorages")
require("./routes/warehouse/retailers")
require("./routes/warehouse/productionCompanies")
require("./routes/warehouse/customers")
require("./routes/warehouse/buy")
require("./routes/warehouse/sell")
require("./routes/warehouse/productTransfer")
require("./routes/warehouse/buyDebts")
require("./routes/warehouse/sellDebts")
require("./routes/notifications")
require("./routes/warehouse/productReduction")

// icu routes
require("./routes/icu/icuDatas")
require("./routes/icu/icuOperatonTypes")
require("./routes/icu/icuShifts")
require("./routes/icu/icuStaff")
require("./routes/icu/products")

// picu routes
require("./routes/picu/picuDatas")
require("./routes/picu/picuOperatonTypes")
require("./routes/picu/picuShifts")
require("./routes/picu/picuStaff")
require("./routes/picu/products")

// sw routes
require("./routes/sw/swDatas")
require("./routes/sw/swOperatonTypes")
require("./routes/sw/products")
require("./routes/sw/swShifts")
require("./routes/sw/swStaff") 

// op routes
require("./routes/op/opDatas")
require("./routes/op/opOperatonTypes")
require("./routes/op/products")
require("./routes/op/opShifts")
require("./routes/op/opStaff")

// clinic routes
require("./routes/clinic/patients")

// pharmacy routes
require("./routes/pharmacy/products")
require("./routes/pharmacy/categories")
require("./routes/pharmacy/productInvoices")
require("./routes/pharmacy/productStorages")
require("./routes/pharmacy/retailers")
require("./routes/pharmacy/productionCompanies")
require("./routes/pharmacy/buy")
require("./routes/pharmacy/productTransfer")
require("./routes/pharmacy/buyDebts")
require("./routes/pharmacy/storages")

// shar warehouse
require("./routes/shar-warehouse/productTransfer")

// accountant routes
require("./routes/accountant/netWorth")
require("./routes/accountant/salaries")
require("./routes/accountant/patientPayment")
require("./routes/accountant/childrenPatientPayment")
require("./routes/accountant/safes")
require("./routes/accountant/picuExpenses")
require("./routes-v1/accountant/surgery/surgeryTypeRoutes")
require("./routes-v1/accountant/surgery/surgeryPricingRoutes")
require("./routes-v1/accountant/surgery/surgeryPricingTemplateRoutes")
require("./routes-v1/accountant/surgery/surgeryTypePricingTemplateRoutes")
require("./routes-v1/accountant/surgery/surgeryCaseRoutes")
require("./routes-v1/accountant/payment/patientPaymentRoutes")
require("./routes-v1/accountant/payment/patientPaymentExpenseRoutes")
require("./routes-v1/accountant/payment/patientPaymentExpenseTemplateRoutes")
require("./routes-v1/accountant/payment/patientPaymentExpenseCategoryRoutes")
require("./routes-v1/accountant/employeeWalletRoutes")
require("./routes-v1/accountant/alertRoutes")

//forms
require("./routes-v1/formRoutes")

// hr routes
require("./routes-v1/hr/employeeRoutes")
require("./routes-v1/hr/employeeRoleRoutes")
require("./routes-v1/hr/departmentRoutes")
require("./routes-v1/hr/departmentLeaderRoutes")
require("./routes-v1/hr/tasks/employeeTaskRoutes")
require("./routes-v1/hr/tasks/employeeTaskChatRoutes")
require("./routes-v1/hr/daily-tasks/employeeDailyTaskRoutes")
require("./routes-v1/hr/employeeFeedbackRoutes")
require("./routes-v1/hr/employeeReportRoutes")
require("./routes-v1/hr/surveyRoutes")
require("./routes-v1/hr/dashboardRoutes")
require("./routes-v1/hr/meetingRoutes")

// asset routes
require("./routes/assets/assets")

// order routes
require("./routes/orders/orders")
require("./routes/orders/departmentOrders")
require("./routes-v1/orderChatRoutes")

// icu v1 routes
require("./routes-v1/icu/icuCaseRoutes")
require("./routes-v1/icu/icuCaseItemRoutes")

// picu v1 routes
require("./routes-v1/picu/picuCaseRoutes")
require("./routes-v1/picu/picuCaseItemRoutes")
require("./routes-v1/picu/picuCaseServiceRoutes")
require("./routes-v1/picu/picuCaseTimeRoutes")
require("./routes-v1/picu/picuServiceRoutes")
require("./routes-v1/picu/picuTimeRoutes")
require("./routes-v1/picu/picuPaymentRoutes")

// perfusion v1 routes
require("./routes-v1/perfusion/perfusionCaseRoutes")
require("./routes-v1/perfusion/perfusionCaseItemRoutes")
require("./routes/perfusion/products")

// anesthesia v1 routes
require("./routes-v1/anesthesia/anesthesiaCaseRoutes")
require("./routes-v1/anesthesia/anesthesiaCaseItemRoutes")
require("./routes/anesthesia/products")

// scrubNurse v1 routes
require("./routes-v1/scrubNurse/scrubNurseCaseRoutes")
require("./routes-v1/scrubNurse/scrubNurseCaseItemRoutes")
require("./routes/scrub-nurse/products")

require("./routes/warehouse/stats")

//crm routes
require('./routes-v1/crm/patient/patientRoutes')
require('./routes-v1/crm/patient/cityRoutes')
require('./routes-v1/crm/patient/statusRoutes')
require('./routes-v1/crm/patient/referTypeRoutes')
require('./routes-v1/crm/patient/referNameRoutes')
require('./routes-v1/crm/patient/addressRoutes')
require('./routes-v1/crm/patient/professionRoutes')
require('./routes-v1/crm/patient/patientDocumentRoutes')

require('./routes-v1/crm/first-stage/firstStageRoutes')
require('./routes-v1/crm/doctors-stage/doctorStageRoutes')
require('./routes-v1/crm/appointment-stage/appointmentStageRoutes')
require('./routes-v1/crm/clinic-stage/clinicStageRoutes')
require('./routes-v1/crm/social-activity/socialActivityRoutes')
require('./routes-v1/crm/social-activity/socialActivityDocumentsRoutes')

require('./routes-v1/crm/surgery-calendar/surgeryTypeRoutes')
require('./routes-v1/crm/surgery-calendar/surgeryStatusRoutes')
require('./routes-v1/crm/surgery-calendar/surgeryCalendarRoutes')
