const {validate} = require("../../../validations/validation");
const {
    employeeTaskCreateValidationRules,
    employeeTaskStatusUpdateValidationRules, employeeTaskEmployeeRateUpdateValidationRules,
    employeeTaskManagerRateUpdateValidationRules, taskIdValidation, employeeTaskSheetUpdateValidationRules,
    employeeTaskUpdateValidationRules, employeeTaskFreezeUpdateValidationRules
} = require("../../../validations/hr/tasks/employeeTaskValidations");
const requirePermissions = require("../../../middlware/requirePermissions");
const permissionsMap = require("../../../utils/permissionMap");
const router = require("../../../config/express");
const {
    createEmployeeTask, updateEmployeeTask, deleteEmployeeTask, getEmployeeSelfTasks, updateEmployeeTaskStatus,
    updateEmployeeTaskSelfRate, updateEmployeeTaskManagerRate, createEmployeeTaskNotification, getEmployeeSelfTask,
    updateEmployeeSelfTaskSheet, getEmployeeTask, updateEmployeeTaskFreeze
} = require("../../../controllers/hr/tasks/employeeTaskController");
const isAuthenticated = require("../../../middlware/isAuthenticatedMiddleware");

router.post(
    '/v1/employee/tasks',
    // requirePermissions([permissionsMap.humanResources]),
    isAuthenticated,
    employeeTaskCreateValidationRules(),
    validate,
    createEmployeeTask
);

router.post(
    '/v1/employee/tasks/:taskId/notification',
    isAuthenticated,
    taskIdValidation,
    validate,
    createEmployeeTaskNotification
);

router.put(
    '/v1/employee/tasks/:taskId',
    // requirePermissions([permissionsMap.humanResources]),
    isAuthenticated,
    employeeTaskUpdateValidationRules(),
    validate,
    updateEmployeeTask
);

router.put(
    '/v1/employee/tasks/:taskId/status',
    // requirePermissions([permissionsMap.humanResources]),
    isAuthenticated,
    employeeTaskStatusUpdateValidationRules(),
    validate,
    updateEmployeeTaskStatus
);

router.put(
    '/v1/employee/tasks/:taskId/employee-rate',
    isAuthenticated,
    employeeTaskEmployeeRateUpdateValidationRules(),
    validate,
    updateEmployeeTaskSelfRate
);

router.put(
    '/v1/employee/tasks/:taskId/freeze',
    isAuthenticated,
    employeeTaskFreezeUpdateValidationRules(),
    validate,
    updateEmployeeTaskFreeze
);

router.put(
    '/v1/employee/tasks/:taskId/manager-rate',
    // requirePermissions([permissionsMap.humanResources]),
    isAuthenticated,
    employeeTaskManagerRateUpdateValidationRules(),
    validate,
    updateEmployeeTaskManagerRate
);

router.delete(
    '/v1/employee/tasks/:taskId',
    // requirePermissions([permissionsMap.humanResources]),
    isAuthenticated,
    validate,
    deleteEmployeeTask
);

router.get(
    '/v1/employee/self/tasks',
    isAuthenticated,
    // requirePermissions([permissionsMap.humanResources]),
    getEmployeeSelfTasks
);

router.get(
    '/v1/employee/self/tasks/:taskId',
    isAuthenticated,
    taskIdValidation,
    validate,
    getEmployeeSelfTask
);

router.get(
    '/v1/employee/tasks/:taskId',
    // requirePermissions([permissionsMap.humanResources]),
    isAuthenticated,
    taskIdValidation,
    validate,
    getEmployeeTask
);

router.put(
    '/v1/employee/self/tasks/:taskId/sheets/:sheetId',
    isAuthenticated,
    employeeTaskSheetUpdateValidationRules(),
    validate,
    updateEmployeeSelfTaskSheet
);
