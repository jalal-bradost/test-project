const {Sequelize} = require("sequelize");

const DB_NAME = process.env.DB_NAME;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_PORT = process.env.DB_PORT;
const DB_SSL = process.env.DB_SSL === "true";

// Set up the Sequelize instance and establish the connection
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST, port: DB_PORT, dialectOptions: {
        ssl: {
            require: true, rejectUnauthorized: false
        }
    }, logging: false, dialect: "postgres", pool: {
        max: 27, min: 0, acquire: 30000, idle: 10000
    }
});

// Import models and define associations
// const Notification = require("./warehouse/Notification")(sequelize)
const Product = require("./warehouse/Product")(sequelize)
const ProductStorage = require("./warehouse/ProductStorage")(sequelize)
const ProductInvoice = require("./warehouse/ProductInvoice")(sequelize)
const Category = require("./warehouse/Category")(sequelize)
const Storage = require("./warehouse/Storage")(sequelize)
const ProductionCompany = require("./warehouse/ProductionCompany")(sequelize)
const Retailer = require("./warehouse/Retailer")(sequelize)
const Customer = require("./warehouse/Customer")(sequelize)
const Buy = require("./warehouse/Buy")(sequelize)
const BuyDebt = require("./warehouse/BuyDebt")(sequelize)
const Sell = require("./warehouse/Sell")(sequelize)
const SellDebt = require("./warehouse/SellDebt")(sequelize)
const Transfer = require("./warehouse/Transfer")(sequelize)
const ProductReduction = require("./warehouse/ProductReduction")(sequelize)

// Accountant
const NetWorth = require("./accountant/NetWorth")(sequelize)
const Salary = require("./accountant/Salary")(sequelize)
const PatientPayment = require("./accountant/payment/PatientPayment")(sequelize)
const PatientPaymentLog = require("./accountant/payment/PatientPaymentLog")(sequelize)
const PatientPaymentExpense = require("./accountant/payment/PatientPaymentExpense")(sequelize)
const PatientPaymentExpenseCategory = require("./accountant/payment/PatientPaymentExpenseCategory")(sequelize)
const PatientPaymentExpenseTemplate = require("./accountant/payment/PatientPaymentExpenseTemplate")(sequelize)
const ChildrenPatientPayment = require("./accountant/ChildrenPatientPayment")(sequelize)
const Safe = require("./accountant/Safe")(sequelize)
const SafeLog = require("./accountant/SafeLog")(sequelize)
const SurgeryType = require("./accountant/surgery/SurgeryType")(sequelize)

const SurgeryCase = require("./accountant/surgery/SurgeryCase")(sequelize)
const SurgeryPricing = require("./accountant/surgery/SurgeryPricing")(sequelize)
const SurgeryPricingTemplate = require("./accountant/surgery/SurgeryPricingTemplate")(sequelize)
const SurgeryTypePricingTemplate = require("./accountant/surgery/SurgeryTypePricingTemplate")(sequelize)
const IcuCase = require("./icu_v1/IcuCase")(sequelize)
const IcuCaseItem = require("./icu_v1/IcuCaseItem")(sequelize)
const SwCase = require("./sw_v1/SwCase")(sequelize)
const SwCaseItem = require("./sw_v1/SwCaseItem")(sequelize)

// Expense
const PICUExpense = require("./accountant/expenses/PICUExpense")(sequelize)
const PICUExpenseConsultation = require("./accountant/expenses/PICUExpenseConsultation")(sequelize)
const PICUExpenseLab = require("./accountant/expenses/PICUExpenseLab")(sequelize)
const PICUExpenseProcedure = require("./accountant/expenses/PICUExpenseProcedure")(sequelize)
const PICUExpenseRadiology = require("./accountant/expenses/PICUExpenseRadiology")(sequelize)
const PICUExpenseTransport = require("./accountant/expenses/PICUExpenseTransport")(sequelize)
const PICULab = require("./accountant/expenses/PICULab")(sequelize)
const PICURadiology = require("./accountant/expenses/PICURadiology")(sequelize)
const PICUSpecialty = require("./accountant/expenses/PICUSpecialty")(sequelize)

const Settings = require("./Settings")(sequelize)
const User = require("./User")(sequelize);
const Role = require("./Role")(sequelize);
const Session = require("./Session")(sequelize);
const Patient = require("./clinic/Patient")(sequelize)

// HR
const EmployeeRole = require("./hr/EmployeeRole")(sequelize)
const Department = require("./hr/Department")(sequelize)
const DepartmentLeader = require("./hr/DepartmentLeader")(sequelize)
const EmployeeWallet = require("./accountant/EmployeeWallet")(sequelize)
const EmployeeTask = require("./hr/EmployeeTask")(sequelize)
const EmployeeTaskNotificationLog = require("./hr/EmployeeTaskNotificationLog")(sequelize)
const EmployeeDailyTask = require("./hr/EmployeeDailyTask")(sequelize)
const EmployeeFeedback = require("./hr/EmployeeFeedback")(sequelize)
const EmployeeTaskChat = require("./hr/EmployeeTaskChat")(sequelize)
const EmployeeTaskChatSeen = require("./hr/EmployeeTaskChatSeen")(sequelize)
const EmployeeWalletLog = require("./accountant/EmployeeWalletLog")(sequelize)
const Employee = require("./hr/Employee")(sequelize)
const EmployeeTaskNotificationLimit = require("./hr/EmployeeTaskNotificationLimit")(sequelize)
const EmployeeTaskSheet = require("./hr/EmployeeTaskSheet")(sequelize)
const EmployeeDailyTaskSheet = require("./hr/EmployeeDailyTaskSheet")(sequelize)
const EmployeeReport = require("./hr/EmployeeReport")(sequelize)
const Survey = require("./hr/Survey")(sequelize)
const SurveyResponse = require("./hr/SurveyResponse")(sequelize)

const Meeting = require("./hr/Meeting")(sequelize)
const MeetingParticipant = require("./hr/MeetingParticipant")(sequelize)
const MeetingIdea = require("./hr/MeetingIdea")(sequelize)


const ICUOperationType = require("./icu/ICUOperationType")(sequelize)
const ICUDataOperationTypeJunction = require("./icu/ICUDataOperationTypeJunction")(sequelize)
const ICUData = require("./icu/ICUData")(sequelize)
const ICUShift = require("./icu/ICUShift")(sequelize)
const ICUStaff = require("./icu/ICUStaff")(sequelize)

const PICUOperationType = require("./picu/PICUOperationType")(sequelize)
const PICUDataOperationTypeJunction = require("./picu/PICUDataOperationTypeJunction")(sequelize)
const PICUData = require("./picu/PICUData")(sequelize)
const PICUShift = require("./picu/PICUShift")(sequelize)
const PICUStaff = require("./picu/PICUStaff")(sequelize)

const SWShift = require("./sw/SWShift")(sequelize)
const SWStaff = require("./sw/SWStaff")(sequelize)

const OPShift = require("./op/OPShift")(sequelize)
const OPStaff = require("./op/OPStaff")(sequelize)

const SWOperationType = require("./sw/SWOperationType")(sequelize)
const SWDataOperationTypeJunction = require("./sw/SWDataOperationTypeJunction")(sequelize)
const SWData = require("./sw/SWData")(sequelize)

const OPOperationType = require("./op/OPOperationType")(sequelize)
const OPDataOperationTypeJunction = require("./op/OPDataOperationTypeJunction")(sequelize)
const OPData = require("./op/OPData")(sequelize)

// assets
const Asset = require("./assets/Asset")(sequelize)
const AssetParent = require("./assets/AssetParent")(sequelize)

// order
const OrderProduct = require("./order/OrderProduct")(sequelize)
const Order = require("./order/Order")(sequelize)

// order
const DepartmentOrderProduct = require("./order/DepartmentOrderProduct")(sequelize)
const DepartmentOrder = require("./order/DepartmentOrder")(sequelize)
const OrderChat = require("./OrderChat")(sequelize)
const OrderChatSeen = require("./OrderChatSeen")(sequelize)
const DepartmentOrderLog = require("./order/DepartmentOrderLog")(sequelize)


//new picu
const PicuPayment = require("./accountant/picu_payment/PicuPayment")(sequelize)
const PicuCase = require("./picu_v1/PicuCase")(sequelize)
const PicuCaseItem = require("./picu_v1/PicuCaseItem")(sequelize)
const PicuCaseService = require("./picu_v1/PicuCaseService")(sequelize)
const PicuCaseTime = require("./picu_v1/PicuCaseTime")(sequelize)
const PicuService = require("./picu_v1/PicuService")(sequelize)
const PicuTime = require("./picu_v1/PicuTime")(sequelize)

const PerfusionCase = require("./perfusion_v1/PerfusionCase")(sequelize)
const PerfusionCaseItem = require("./perfusion_v1/PerfusionCaseItem")(sequelize)

PerfusionCase.hasMany(PerfusionCaseItem, {
    foreignKey: 'perfusionCaseId', onDelete: 'CASCADE', as: "items"
});
PerfusionCaseItem.belongsTo(PerfusionCase, {
    foreignKey: 'perfusionCaseId', as: "case"
});

const AnesthesiaCase = require("./anesthesia_v1/AnesthesiaCase")(sequelize)
const AnesthesiaCaseItem = require("./anesthesia_v1/AnesthesiaCaseItem")(sequelize)

AnesthesiaCase.hasMany(AnesthesiaCaseItem, {
    foreignKey: 'anesthesiaCaseId', onDelete: 'CASCADE', as: "items"
});
AnesthesiaCaseItem.belongsTo(AnesthesiaCase, {
    foreignKey: 'anesthesiaCaseId', as: "case"
});

const ScrubNurseCase = require("./scrubNurse_v1/ScrubNurseCase")(sequelize)
const ScrubNurseCaseItem = require("./scrubNurse_v1/ScrubNurseCaseItem")(sequelize)

ScrubNurseCase.hasMany(ScrubNurseCaseItem, {
    foreignKey: 'scrubNurseCaseId', onDelete: 'CASCADE', as: "items"
});
ScrubNurseCaseItem.belongsTo(ScrubNurseCase, {
    foreignKey: 'scrubNurseCaseId', as: "case"
});

Safe.hasMany(SafeLog, {
    foreignKey: 'safeId', onDelete: 'RESTRICT', as: "logs"
});

SafeLog.belongsTo(Safe, {
    foreignKey: 'safeId', as: "safe"
});

PicuCase.hasMany(PicuCaseItem, {
    foreignKey: 'picuCaseId', onDelete: 'CASCADE', as: "items"
});
PicuCaseItem.belongsTo(PicuCase, {
    foreignKey: 'picuCaseId', as: "case"
});

PicuCase.hasOne(PicuPayment, {
    foreignKey: 'picuCaseId', onDelete: 'CASCADE', as: "payment"
});
PicuPayment.belongsTo(PicuCase, {
    foreignKey: 'picuCaseId', as: "picuCase"
});

Patient.hasMany(PicuCase, {
    foreignKey: 'patientId', onDelete: 'RESTRICT', as: "picuCases"
});
PicuCase.belongsTo(Patient, {
    foreignKey: 'patientId', as: "patient"
});

PicuCase.hasMany(PicuCaseService, {
    foreignKey: 'picuCaseId', onDelete: 'CASCADE', as: "services"
});
PicuCaseService.belongsTo(PicuCase, {
    foreignKey: 'picuCaseId', as: "case"
});

PicuCase.hasMany(PicuCaseTime, {
    foreignKey: 'picuCaseId', onDelete: 'CASCADE', as: "times"
});
PicuCaseTime.belongsTo(PicuCase, {
    foreignKey: 'picuCaseId', as: "case"
});


EmployeeWallet.belongsTo(Employee, {
    foreignKey: 'employeeId', as: "employee"
});
Employee.hasOne(EmployeeWallet, {
    foreignKey: 'employeeId', onDelete: 'CASCADE', as: 'wallet'
});

Employee.hasMany(EmployeeReport, {
    foreignKey: 'employeeId', onDelete: 'CASCADE', as: 'restrict'
});
EmployeeReport.belongsTo(Employee, {
    foreignKey: 'employeeId', as: 'employee'
});

EmployeeWallet.hasMany(EmployeeWalletLog, {
    foreignKey: 'employeeId', onDelete: 'CASCADE', as: 'logs'
});
EmployeeWalletLog.belongsTo(EmployeeWallet, {
    foreignKey: 'employeeId'
});

SurgeryType.hasMany(SurgeryCase, {
    foreignKey: "surgeryTypeId", onDelete: 'RESTRICT'
});
SurgeryCase.belongsTo(SurgeryType, {
    foreignKey: "surgeryTypeId", as: "surgeryType"
});

SurgeryType.hasMany(SurgeryPricingTemplate, {
    foreignKey: "surgeryTypeId", onDelete: 'RESTRICT'
});
SurgeryPricingTemplate.belongsTo(SurgeryType, {
    foreignKey: "surgeryTypeId", as: "surgeryType"
});

EmployeeRole.hasMany(SurgeryPricingTemplate, {
    foreignKey: "roleId", onDelete: 'RESTRICT'
});
SurgeryPricingTemplate.belongsTo(EmployeeRole, {
    foreignKey: "roleId", as: "role"
});

Employee.hasMany(SurgeryTypePricingTemplate, {
    foreignKey: "employeeId", onDelete: 'RESTRICT', as: "pricingTemplates"
});
SurgeryTypePricingTemplate.belongsTo(Employee, {
    foreignKey: "employeeId", as: "employee"
});

SurgeryType.hasMany(SurgeryTypePricingTemplate, {
    foreignKey: "surgeryTypeId", onDelete: 'RESTRICT', as: "pricingTemplates"
});
SurgeryTypePricingTemplate.belongsTo(SurgeryType, {
    foreignKey: "surgeryTypeId", as: "surgeryType"
});


SurgeryPricingTemplate.hasMany(SurgeryTypePricingTemplate, {
    foreignKey: "surgeryPricingTemplateId", onDelete: 'RESTRICT'
});
SurgeryTypePricingTemplate.belongsTo(SurgeryPricingTemplate, {
    foreignKey: "surgeryPricingTemplateId", as: "pricingTemplate"
});

Patient.hasMany(SurgeryCase, {
    foreignKey: "patientId", onDelete: 'RESTRICT', as: "surgeryCases"
});
SurgeryCase.belongsTo(Patient, {
    foreignKey: "patientId", as: "patient"
});

SurgeryCase.hasMany(SurgeryPricing, {
    foreignKey: "surgeryCaseId", onDelete: 'RESTRICT', as: "pricings"
});

SurgeryPricing.belongsTo(SurgeryCase, {
    foreignKey: "surgeryCaseId", as: "surgeryCase"
});

SurgeryPricing.belongsTo(Employee, {
    foreignKey: "employeeId", as: "employee"
});

Employee.hasMany(SurgeryPricing, {
    foreignKey: "employeeId", onDelete: 'RESTRICT', as: "pricings"
});

Product.hasMany(ProductInvoice, {
    foreignKey: "barcode", onDelete: 'CASCADE'
})
ProductInvoice.belongsTo(Product, {
    foreignKey: "barcode"
})

Category.hasMany(Product, {
    foreignKey: 'categoryId', onDelete: 'RESTRICT'
});
Product.belongsTo(Category, {
    foreignKey: 'categoryId'
});

Employee.hasMany(Salary, {
    foreignKey: 'employeeId', onDelete: 'RESTRICT'
});
Salary.belongsTo(Employee, {
    foreignKey: 'employeeId'
});

Product.hasMany(ProductStorage, {
    foreignKey: 'barcode', onDelete: 'RESTRICT'
});
ProductStorage.belongsTo(Product, {
    foreignKey: 'barcode'
});

ProductInvoice.belongsTo(Retailer, {
    foreignKey: 'retailerId'
})
Retailer.hasMany(ProductInvoice, {
    foreignKey: 'retailerId', onDelete: 'RESTRICT'
})

ProductionCompany.hasMany(Product, {
    foreignKey: 'productionCompanyId', onDelete: 'RESTRICT'
});
Product.belongsTo(ProductionCompany, {
    foreignKey: 'productionCompanyId'
});

Storage.hasMany(ProductStorage, {
    foreignKey: 'storageId', onDelete: 'RESTRICT'
});
ProductStorage.belongsTo(Storage, {
    foreignKey: 'storageId'
});

Buy.belongsTo(Retailer, {
    foreignKey: 'retailerId'
})
Retailer.hasMany(Buy, {
    foreignKey: 'retailerId', onDelete: 'RESTRICT'
})

Sell.belongsTo(Customer, {
    foreignKey: 'customerId'
})
Customer.hasMany(Sell, {
    foreignKey: 'customerId', onDelete: 'RESTRICT'
})

Patient.hasMany(PICUData, {
    foreignKey: 'patientId', onDelete: 'RESTRICT'
});
PICUData.belongsTo(Patient, {
    foreignKey: 'patientId'
});

Patient.hasMany(SWData, {
    foreignKey: 'patientId', onDelete: 'RESTRICT'
});
SWData.belongsTo(Patient, {
    foreignKey: 'patientId'
});

Buy.hasOne(BuyDebt, {foreignKey: 'buyId', onDelete: 'CASCADE'});
BuyDebt.belongsTo(Buy, {foreignKey: 'buyId'});

Sell.hasOne(SellDebt, {foreignKey: 'sellId', onDelete: 'CASCADE'});
SellDebt.belongsTo(Sell, {foreignKey: 'sellId'});

User.hasMany(Session, {foreignKey: 'userId', onDelete: 'CASCADE'});
Session.belongsTo(User, {foreignKey: 'userId'});

Role.hasMany(User, {foreignKey: 'roleId', onDelete: 'RESTRICT'});
User.belongsTo(Role, {foreignKey: 'roleId'});

User.hasMany(NetWorth, {foreignKey: 'userId', onDelete: 'RESTRICT'});
NetWorth.belongsTo(User, {foreignKey: 'userId'});

Transfer.belongsTo(Storage, {
    foreignKey: 'toStorageId', as: 'toStorage'
});

Patient.hasMany(ICUData, {
    foreignKey: "patientId", onDelete: 'RESTRICT'
})

ICUData.belongsTo(Patient, {
    foreignKey: "patientId"
});

Patient.hasMany(OPData, {
    foreignKey: "patientId", onDelete: 'RESTRICT'
})

OPData.belongsTo(Patient, {
    foreignKey: "patientId"
});

Patient.hasMany(PerfusionCase, {
    foreignKey: "patientId", onDelete: 'RESTRICT', as: "perfusionCases"
})

PerfusionCase.belongsTo(Patient, {
    foreignKey: "patientId", as: "patient"
});

Patient.hasMany(AnesthesiaCase, {
    foreignKey: "patientId", onDelete: 'RESTRICT', as: "anesthesiaCases"
})

AnesthesiaCase.belongsTo(Patient, {
    foreignKey: "patientId", as: "patient"
});

Patient.hasMany(ScrubNurseCase, {
    foreignKey: "patientId", onDelete: 'RESTRICT', as: "scrubNurseCases"
})

ScrubNurseCase.belongsTo(Patient, {
    foreignKey: "patientId", as: "patient"
});

Salary.hasMany(NetWorth, {
    foreignKey: "salaryId", onDelete: 'CASCADE'
})

NetWorth.belongsTo(Salary, {
    foreignKey: "salaryId"
});

Patient.hasMany(PatientPayment, {
    foreignKey: "patientId", onDelete: 'RESTRICT'
})

PatientPayment.belongsTo(Patient, {
    foreignKey: "patientId"
});

PatientPayment.hasMany(PatientPaymentLog, {
    foreignKey: "patientPaymentId", onDelete: 'CASCADE', as: "logs"
});

PatientPaymentLog.belongsTo(PatientPayment, {
    foreignKey: "patientPaymentId"
});

PatientPayment.hasMany(PatientPaymentExpense, {
    foreignKey: "patientPaymentId", onDelete: 'CASCADE', as: "expenses"
})

PatientPaymentExpense.belongsTo(PatientPayment, {
    foreignKey: "patientPaymentId"
});

PatientPaymentExpenseCategory.hasMany(PatientPaymentExpense, {
    foreignKey: "categoryId", onDelete: 'RESTRICT'
});
PatientPaymentExpense.belongsTo(PatientPaymentExpenseCategory, {
    foreignKey: "categoryId", as: "category"
});

PatientPaymentExpenseCategory.hasMany(PatientPaymentExpenseTemplate, {
    foreignKey: "categoryId", onDelete: 'RESTRICT'
});
PatientPaymentExpenseTemplate.belongsTo(PatientPaymentExpenseCategory, {
    foreignKey: "categoryId", as: "category"
});

PatientPayment.belongsTo(ICUData, {
    foreignKey: "icuId", onDelete: 'RESTRICT'
});

ICUData.hasOne(PatientPayment, {
    foreignKey: "icuId"
});

PatientPayment.belongsTo(SurgeryCase, {
    foreignKey: "surgeryCaseId", onDelete: 'RESTRICT', as: "surgeryCase"
});

SurgeryCase.hasOne(PatientPayment, {
    foreignKey: "surgeryCaseId", as: "patientPayment"
});

PerfusionCase.hasOne(PatientPayment, {
    foreignKey: "perfusionCaseId", as: "patientPayment"
});

PatientPayment.belongsTo(PerfusionCase, {
    foreignKey: "perfusionCaseId", onDelete: 'RESTRICT', as: "perfusionCase"
});

AnesthesiaCase.hasOne(PatientPayment, {
    foreignKey: "anesthesiaCaseId", as: "patientPayment"
});

PatientPayment.belongsTo(AnesthesiaCase, {
    foreignKey: "anesthesiaCaseId", onDelete: 'RESTRICT', as: "anesthesiaCase"
});

ScrubNurseCase.hasOne(PatientPayment, {
    foreignKey: "scrubNurseCaseId", as: "patientPayment"
});

PatientPayment.belongsTo(OPData, {
    foreignKey: "opId", onDelete: 'RESTRICT'
});

OPData.hasOne(PatientPayment, {
    foreignKey: "opId"
});

PatientPayment.belongsTo(SWData, {
    foreignKey: "swId", onDelete: 'RESTRICT'
});

SWData.hasOne(PatientPayment, {
    foreignKey: "swId"
});

//Children
Patient.hasMany(ChildrenPatientPayment, {
    foreignKey: "patientId", onDelete: 'RESTRICT'
})

ChildrenPatientPayment.belongsTo(Patient, {
    foreignKey: "patientId"
});

ChildrenPatientPayment.belongsTo(ICUData, {
    foreignKey: "icuId", onDelete: 'RESTRICT'
});

ICUData.hasOne(ChildrenPatientPayment, {
    foreignKey: "icuId"
});

ChildrenPatientPayment.belongsTo(PICUData, {
    foreignKey: "picuId", onDelete: 'RESTRICT'
});

PICUData.hasOne(ChildrenPatientPayment, {
    foreignKey: "picuId"
});

ChildrenPatientPayment.belongsTo(OPData, {
    foreignKey: "opId", onDelete: 'RESTRICT'
});

OPData.hasOne(ChildrenPatientPayment, {
    foreignKey: "opId"
});

ChildrenPatientPayment.belongsTo(SWData, {
    foreignKey: "swId", onDelete: 'RESTRICT'
});

SWData.hasOne(ChildrenPatientPayment, {
    foreignKey: "swId"
});

ICUData.belongsToMany(ICUOperationType, {
    through: ICUDataOperationTypeJunction, foreignKey: 'icuId', otherKey: 'icuOperationTypeId', onDelete: 'CASCADE'
});
ICUOperationType.belongsToMany(ICUData, {
    through: ICUDataOperationTypeJunction, foreignKey: 'icuOperationTypeId', otherKey: 'icuId', onDelete: 'RESTRICT'
});

PICUData.belongsToMany(PICUOperationType, {
    through: PICUDataOperationTypeJunction, foreignKey: 'picuId', otherKey: 'picuOperationTypeId', onDelete: 'CASCADE'
});
PICUOperationType.belongsToMany(PICUData, {
    through: PICUDataOperationTypeJunction, foreignKey: 'picuOperationTypeId', otherKey: 'picuId', onDelete: 'RESTRICT'
});

SWData.belongsToMany(SWOperationType, {
    through: SWDataOperationTypeJunction, foreignKey: 'swId', otherKey: 'swOperationTypeId', onDelete: 'CASCADE'
});
SWOperationType.belongsToMany(SWData, {
    through: SWDataOperationTypeJunction, foreignKey: 'swOperationTypeId', otherKey: 'swId', onDelete: 'RESTRICT'
});

OPData.belongsToMany(OPOperationType, {
    through: OPDataOperationTypeJunction, foreignKey: 'opId', otherKey: 'opOperationTypeId', onDelete: 'CASCADE'
});
OPOperationType.belongsToMany(OPData, {
    through: OPDataOperationTypeJunction, foreignKey: 'opOperationTypeId', otherKey: 'opId', onDelete: 'RESTRICT'
});

AssetParent.hasMany(Asset, {
    foreignKey: 'assetParentId', onDelete: 'CASCADE'
});
Asset.belongsTo(AssetParent, {
    foreignKey: 'assetParentId'
});

Order.hasMany(OrderProduct, {
    foreignKey: 'orderId', onDelete: 'CASCADE'
});
OrderProduct.belongsTo(Order, {
    foreignKey: 'orderId'
});

DepartmentOrder.hasMany(DepartmentOrderProduct, {
    foreignKey: 'orderId', onDelete: 'CASCADE'
});
DepartmentOrderProduct.belongsTo(DepartmentOrder, {
    foreignKey: 'orderId'
});

DepartmentOrder.hasMany(OrderChat, {
    foreignKey: 'orderId', onDelete: 'CASCADE', as: "chats"
});
OrderChat.belongsTo(DepartmentOrder, {
    foreignKey: 'orderId'
});

OrderChat.hasMany(OrderChatSeen, {foreignKey: 'chatId', as: "seenBy"});
OrderChatSeen.belongsTo(OrderChat, {foreignKey: 'chatId'});

EmployeeTaskChat.hasMany(EmployeeTaskChatSeen, {foreignKey: 'chatId', as: "seenBy"});
EmployeeTaskChatSeen.belongsTo(EmployeeTaskChat, {foreignKey: 'chatId'});

User.hasMany(OrderChat, {
    foreignKey: 'userId', onDelete: 'CASCADE', as: "chats"
});
OrderChat.belongsTo(User, {
    foreignKey: 'userId', as: "user"
});

User.hasMany(DepartmentOrder, {
    foreignKey: 'userId', onDelete: 'RESTRICT', as: "orders"
});
DepartmentOrder.belongsTo(User, {
    foreignKey: 'userId', as: "user"
});

DepartmentOrder.hasMany(DepartmentOrderLog, {
    foreignKey: 'orderId', onDelete: 'CASCADE'
});
DepartmentOrderLog.belongsTo(DepartmentOrder, {
    foreignKey: 'orderId'
});

User.hasMany(DepartmentOrderLog, {
    foreignKey: 'userId'
});
DepartmentOrderLog.belongsTo(User, {
    foreignKey: 'userId'
});

Product.hasMany(ProductReduction, {
    foreignKey: 'barcode', onDelete: 'RESTRICT'
});

ProductReduction.belongsTo(Product, {
    foreignKey: 'barcode'
});

Storage.hasMany(ProductReduction, {
    foreignKey: 'storageId', onDelete: 'RESTRICT'
});

ProductReduction.belongsTo(Storage, {
    foreignKey: 'storageId'
});

PICUExpense.hasMany(PICUExpenseConsultation, {
    foreignKey: 'picuExpenseId', onDelete: 'RESTRICT'
});

PICUExpenseConsultation.belongsTo(PICUExpense, {
    foreignKey: 'picuExpenseId'
});

PICUExpense.hasMany(PICUExpenseLab, {
    foreignKey: 'picuExpenseId', onDelete: 'RESTRICT'
});

PICUExpenseLab.belongsTo(PICUExpense, {
    foreignKey: 'picuExpenseId'
});

PICUExpense.hasMany(PICUExpenseProcedure, {
    foreignKey: 'picuExpenseId', onDelete: 'RESTRICT'
});

PICUExpenseProcedure.belongsTo(PICUExpense, {
    foreignKey: 'picuExpenseId'
});

PICUExpense.hasMany(PICUExpenseRadiology, {
    foreignKey: 'picuExpenseId', onDelete: 'RESTRICT'
});

PICUExpenseRadiology.belongsTo(PICUExpense, {
    foreignKey: 'picuExpenseId'
});

PICUExpense.hasMany(PICUExpenseTransport, {
    foreignKey: 'picuExpenseId', onDelete: 'RESTRICT'
});

PICUExpenseTransport.belongsTo(PICUExpense, {
    foreignKey: 'picuExpenseId'
});

PICULab.hasMany(PICUExpenseLab, {
    foreignKey: 'picuLabId', onDelete: 'RESTRICT'
});

PICUExpenseLab.belongsTo(PICULab, {
    foreignKey: 'picuLabId'
});

PICURadiology.hasMany(PICUExpenseRadiology, {
    foreignKey: 'picuRadiologyId', onDelete: 'RESTRICT'
});

PICUExpenseRadiology.belongsTo(PICURadiology, {
    foreignKey: 'picuRadiologyId'
});

PICUSpecialty.hasMany(PICUExpenseConsultation, {
    foreignKey: 'picuSpecialtyId', onDelete: 'RESTRICT'
});

PICUExpenseConsultation.belongsTo(PICUSpecialty, {
    foreignKey: 'picuSpecialtyId'
});

Department.hasMany(Employee, {
    foreignKey: 'departmentId', onDelete: 'RESTRICT', as: 'employees'
});

Employee.belongsTo(Department, {
    foreignKey: 'departmentId', as: 'department'
});

Department.hasMany(DepartmentLeader, {
    foreignKey: 'departmentId', onDelete: 'RESTRICT', as: 'leaders'
});
DepartmentLeader.belongsTo(Department, {
    foreignKey: 'departmentId', as: 'department'
});

Employee.hasMany(DepartmentLeader, {
    foreignKey: 'employeeId', onDelete: 'RESTRICT', as: 'leaders'
});
DepartmentLeader.belongsTo(Employee, {
    foreignKey: 'employeeId', as: 'employee'
});

Employee.hasMany(EmployeeTask, {
    foreignKey: 'employeeId', onDelete: 'CASCADE', as: 'tasks'
});
EmployeeTask.belongsTo(Employee, {
    foreignKey: 'employeeId', as: 'employee'
});

Employee.hasMany(EmployeeDailyTask, {
    foreignKey: 'employeeId', onDelete: 'CASCADE', as: 'dailyTasks'
});
EmployeeDailyTask.belongsTo(Employee, {
    foreignKey: 'employeeId', as: 'employee'
});

Employee.hasMany(EmployeeFeedback, {
    foreignKey: 'employeeId', onDelete: 'CASCADE', as: 'feedbacks'
});
EmployeeFeedback.belongsTo(Employee, {
    foreignKey: 'employeeId', as: 'employee'
});

EmployeeTaskChat.belongsTo(EmployeeTask, {
    foreignKey: 'taskId', onDelete: 'CASCADE', as: 'task'
});
EmployeeTask.hasMany(EmployeeTaskChat, {
    foreignKey: 'taskId', onDelete: 'CASCADE', as: 'chats'
});


EmployeeTask.hasMany(EmployeeTaskSheet, {
    foreignKey: 'taskId', onDelete: 'CASCADE', as: 'sheets'
});
EmployeeTaskSheet.belongsTo(EmployeeTask, {
    foreignKey: 'taskId', as: 'task'
});

EmployeeDailyTask.hasMany(EmployeeDailyTaskSheet, {
    foreignKey: 'taskId', onDelete: 'CASCADE', as: 'sheets'
});
EmployeeDailyTaskSheet.belongsTo(EmployeeDailyTask, {
    foreignKey: 'taskId', as: 'task'
});

User.hasMany(EmployeeTaskChat, {
    foreignKey: 'userId', onDelete: 'CASCADE', as: "taskChats"
});
EmployeeTaskChat.belongsTo(User, {
    foreignKey: 'userId', as: "user"
});

EmployeeRole.hasMany(Employee, {
    foreignKey: 'roleId', onDelete: 'RESTRICT', as: 'employees'
});

Employee.belongsTo(EmployeeRole, {
    foreignKey: 'roleId', as: 'role'
});

User.hasOne(Employee, {
    foreignKey: 'userId', onDelete: 'RESTRICT', as: 'employee'
});

Employee.belongsTo(User, {
    foreignKey: 'userId', as: 'user'
});

Survey.hasMany(SurveyResponse, {
    foreignKey: 'surveyId', onDelete: 'CASCADE', as: 'responses'
});
SurveyResponse.belongsTo(Survey, {
    foreignKey: 'surveyId', as: 'survey'
});

User.hasMany(SurveyResponse, {
    foreignKey: 'userId', onDelete: 'CASCADE', as: 'responses'
});

Survey.belongsTo(Department, {
    foreignKey: 'departmentId', as: 'department'
});

Department.hasMany(Survey, {
    foreignKey: 'departmentId', onDelete: 'RESTRICT', as: 'surveys'
});


Meeting.hasMany(MeetingParticipant, {
    foreignKey: 'meetingId', onDelete: 'CASCADE', as: "participants"
});
MeetingParticipant.belongsTo(Meeting, {
    foreignKey: 'meetingId', as: "meeting"
});

Meeting.belongsTo(Employee, {
    foreignKey: 'hostId', as: "host"
});
Employee.hasMany(Meeting, {
    foreignKey: 'hostId', as: "meetings"
});

Meeting.hasMany(MeetingIdea, {
    foreignKey: 'meetingId', onDelete: 'CASCADE', as: "ideas"
});
MeetingIdea.belongsTo(Meeting, {
    foreignKey: 'meetingId', as: "meeting"
});

MeetingIdea.belongsTo(Employee, {
    foreignKey: 'employeeId', as: "employee"
});
Employee.hasMany(MeetingIdea, {
    foreignKey: 'employeeId', as: "ideas"
});

MeetingParticipant.belongsTo(Employee, {
    foreignKey: 'employeeId', as: "employee"
});
Employee.hasMany(MeetingParticipant, {
    foreignKey: 'employeeId', as: "participants"
});

// Export the Sequelize instance and models
module.exports = {
    sequelize,
    Product,
    Category,
    Storage,
    ProductStorage,
    ProductInvoice,
    Retailer,
    ProductionCompany,
    Customer,
    Buy,
    BuyDebt,
    Sell,
    SellDebt,
    User,
    Session,
    Settings,
    Patient,
    ICUOperationType,
    ICUDataOperationTypeJunction,
    ICUShift,
    ICUStaff,
    ICUData,
    PICUOperationType,
    PICUDataOperationTypeJunction,
    PICUShift,
    PICUStaff,
    PICUData,
    SWData,
    SWOperationType,
    SWDataOperationTypeJunction,
    OPOperationType,
    OPDataOperationTypeJunction,
    OPData,
    Transfer,
    Role,
    NetWorth,
    Employee,
    Salary,
    PatientPayment,
    Asset,
    AssetParent,
    OPShift,
    OPStaff,
    SWShift,
    SWStaff,
    ProductReduction,
    Safe,
    SafeLog,
    ChildrenPatientPayment,
    PICUExpense,
    PICUExpenseConsultation,
    PICUExpenseLab,
    PICUExpenseProcedure,
    PICUExpenseRadiology,
    PICUExpenseTransport,
    PICULab,
    PICURadiology,
    PICUSpecialty,
    OrderProduct,
    Order,
    DepartmentOrderProduct,
    DepartmentOrder,
    DepartmentOrderLog,
    Department,
    EmployeeRole,
    SurgeryType,
    SurgeryCase,
    SurgeryPricing,
    SurgeryPricingTemplate,
    IcuCase,
    IcuCaseItem,
    SwCase,
    SwCaseItem,
    PatientPaymentExpense,
    PatientPaymentExpenseTemplate,
    PatientPaymentExpenseCategory,
    PatientPaymentLog,
    EmployeeWallet,
    EmployeeWalletLog,
    OrderChat,
    PicuCase,
    PicuCaseItem,
    PicuCaseService,
    PicuCaseTime,
    PicuService,
    PicuTime,
    PicuPayment,
    EmployeeTask,
    EmployeeTaskChat,
    EmployeeFeedback,
    PerfusionCase,
    PerfusionCaseItem,
    AnesthesiaCase,
    AnesthesiaCaseItem,
    ScrubNurseCase,
    ScrubNurseCaseItem,
    EmployeeTaskNotificationLimit,
    EmployeeTaskSheet,
    EmployeeReport,
    SurgeryTypePricingTemplate,
    DepartmentLeader,
    EmployeeDailyTask,
    EmployeeDailyTaskSheet,
    Survey,
    SurveyResponse,
    OrderChatSeen,
    EmployeeTaskChatSeen,
    EmployeeTaskNotificationLog,
    Meeting,
    MeetingParticipant,
    MeetingIdea
};
