const { validate } = require("../../validations/validation");
const { employeeRoleValidationRules } = require("../../validations/hr/employeeRoleValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const { createEmployeeRole, updateEmployeeRole, deleteEmployeeRole, getEmployeeRoles } = require("../../controllers/hr/employeeRoleController");

router.post(
    '/v1/employee-roles',
    requirePermissions([permissionsMap.humanResources]),
    employeeRoleValidationRules(),
    validate,
    createEmployeeRole
);

router.put(
    '/v1/employee-roles/:roleId',
    requirePermissions([permissionsMap.humanResources]),
    employeeRoleValidationRules(),
    validate,
    updateEmployeeRole
);

router.delete(
    '/v1/employee-roles/:roleId',
    requirePermissions([permissionsMap.humanResources]),
    validate,
    deleteEmployeeRole
);

router.get(
    '/v1/employee-roles',
    requirePermissions([permissionsMap.humanResources]),
    getEmployeeRoles
);