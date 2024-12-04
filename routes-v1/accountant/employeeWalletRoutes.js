const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express")
const {getEmployeeWallets, getEmployeeWallet, getEmployeeSelfWallet} = require("../../controllers/accountant/employeeWalletController");
const {employeeIdValidation} = require("../../validations/hr/employeeValidations");
const isAuthenticated = require("../../middlware/isAuthenticatedMiddleware");
router.get(
    '/v1/employees/wallets',
    requirePermissions([permissionsMap.accountant]),
    getEmployeeWallets
);
router.get(
    '/v1/employees/:employeeId/wallet',
    requirePermissions([permissionsMap.accountant]),
    employeeIdValidation,
    getEmployeeWallet
);

router.get(
    '/v1/employee/self/wallet',
    isAuthenticated,
    getEmployeeSelfWallet
);