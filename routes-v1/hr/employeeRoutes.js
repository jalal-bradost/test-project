const {validate} = require("../../validations/validation");
const {employeeModificationValidationRules, employeeDeletionValidationRules, employeeIdValidation} = require("../../validations/hr/employeeValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const {employeeCreationValidationRules} = require("../../validations/hr/employeeValidations");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express")
const {createEmployee, updateEmployee, deleteEmployee, getEmployees, getEmployee} = require("../../controllers/hr/employeeController");
const isAuthenticated = require("../../middlware/isAuthenticatedMiddleware");
router.post(
    '/v1/employees',
    requirePermissions([permissionsMap.humanResources]),
    employeeCreationValidationRules(),
    validate,
    createEmployee
);
router.put(
    '/v1/employees/:employeeId',
    requirePermissions([permissionsMap.humanResources]),
    employeeModificationValidationRules(),
    validate,
    updateEmployee
);
router.delete(
    '/v1/employees/:employeeId',
    requirePermissions([permissionsMap.humanResources]),
    employeeDeletionValidationRules(),
    validate,
    deleteEmployee
);
router.get(
    '/v1/employees',
    requirePermissions([permissionsMap.humanResources, permissionsMap.surgeryStaff]),
    getEmployees
);

router.get(
    '/v1/employees/:employeeId',
    // requirePermissions([permissionsMap.humanResources]),
    isAuthenticated,
    employeeIdValidation,
    getEmployee
);