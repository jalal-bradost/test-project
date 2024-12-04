const { validate } = require("../../validations/validation");
const { departmentLeaderValidationRules } = require("../../validations/hr/departmentLeaderValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const { createDepartmentLeader, updateDepartmentLeader, deleteDepartmentLeader, getDepartmentLeaders } = require("../../controllers/hr/departmentLeaderController");

router.post(
    '/v1/departments/leaders',
    requirePermissions([permissionsMap.humanResources]),
    departmentLeaderValidationRules(),
    validate,
    createDepartmentLeader
);

router.put(
    '/v1/departments/leaders/:departmentLeaderId',
    requirePermissions([permissionsMap.humanResources]),
    departmentLeaderValidationRules(),
    validate,
    updateDepartmentLeader
);

router.delete(
    '/v1/departments/leaders/:departmentLeaderId',
    requirePermissions([permissionsMap.humanResources]),
    validate,
    deleteDepartmentLeader
);

router.get(
    '/v1/departments/leaders',
    requirePermissions([permissionsMap.humanResources]),
    getDepartmentLeaders
);