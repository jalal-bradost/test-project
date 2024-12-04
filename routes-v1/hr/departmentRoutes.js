const { validate } = require("../../validations/validation");
const { departmentValidationRules, departmentIdValidation} = require("../../validations/hr/departmentValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const { createDepartment, updateDepartment, deleteDepartment, getDepartments, getDepartment} = require("../../controllers/hr/departmentController");
const isAuthenticated = require("../../middlware/isAuthenticatedMiddleware");

router.post(
    '/v1/departments',
    requirePermissions([permissionsMap.humanResources]),
    departmentValidationRules(),
    validate,
    createDepartment
);

router.put(
    '/v1/departments/:departmentId',
    requirePermissions([permissionsMap.humanResources]),
    departmentValidationRules(),
    validate,
    updateDepartment
);

router.delete(
    '/v1/departments/:departmentId',
    requirePermissions([permissionsMap.humanResources]),
    validate,
    deleteDepartment
);

router.get(
    '/v1/departments',
    requirePermissions([permissionsMap.humanResources]),
    getDepartments
);

router.get(
    '/v1/departments/:departmentId',
    // requirePermissions([permissionsMap.humanResources]),
    isAuthenticated,
    departmentIdValidation,
    getDepartment
);