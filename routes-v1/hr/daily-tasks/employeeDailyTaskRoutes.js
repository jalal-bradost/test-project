const {validate} = require("../../../validations/validation");
const {
    employeeDailyTaskCreateValidationRules,
    employeeDailyTaskManagerRateUpdateValidationRules,
    taskIdValidation,
    employeeDailyTaskSheetUpdateValidationRules,
    employeeDailyTaskUpdateValidationRules
} = require("../../../validations/hr/daily-tasks/employeeDailyTaskValidations");
const requirePermissions = require("../../../middlware/requirePermissions");
const permissionsMap = require("../../../utils/permissionMap");
const router = require("../../../config/express");
const {
    createEmployeeDailyTask,
    updateEmployeeDailyTask,
    deleteEmployeeDailyTask,
    getEmployeeSelfDailyTasks,
    updateEmployeeDailyTaskManagerRate,
    createEmployeeDailyTaskNotification,
    getEmployeeSelfDailyTask,
    updateEmployeeSelfDailyTaskSheet,
    getEmployeeDailyTask
} = require("../../../controllers/hr/daily-tasks/employeeDailyTaskController");
const isAuthenticated = require("../../../middlware/isAuthenticatedMiddleware");

router.post(
    '/v1/employee/daily-tasks',
    // requirePermissions([permissionsMap.humanResources]),
    isAuthenticated,
    employeeDailyTaskCreateValidationRules(),
    validate,
    createEmployeeDailyTask
);

router.post(
    '/v1/employee/daily-tasks/:taskId/notification',
    isAuthenticated,
    taskIdValidation,
    validate,
    createEmployeeDailyTaskNotification
);

router.put(
    '/v1/employee/daily-tasks/:taskId',
    // requirePermissions([permissionsMap.humanResources]),
    isAuthenticated,
    employeeDailyTaskUpdateValidationRules(),
    validate,
    updateEmployeeDailyTask
);

router.put(
    '/v1/employee/daily-tasks/:taskId/manager-rate',
    // requirePermissions([permissionsMap.humanResources]),
    isAuthenticated,
    employeeDailyTaskManagerRateUpdateValidationRules(),
    validate,
    updateEmployeeDailyTaskManagerRate
);

router.delete(
    '/v1/employee/daily-tasks/:taskId',
    // requirePermissions([permissionsMap.humanResources]),
    isAuthenticated,
    validate,
    deleteEmployeeDailyTask
);

router.get(
    '/v1/employee/self/daily-tasks',
    isAuthenticated,
    // requirePermissions([permissionsMap.humanResources]),
    getEmployeeSelfDailyTasks
);

router.get(
    '/v1/employee/self/daily-tasks/:taskId',
    isAuthenticated,
    taskIdValidation,
    validate,
    getEmployeeSelfDailyTask
);

router.get(
    '/v1/employee/daily-tasks/:taskId',
    // requirePermissions([permissionsMap.humanResources]),
    isAuthenticated,
    taskIdValidation,
    validate,
    getEmployeeDailyTask
);

router.post(
    '/v1/employee/self/daily-tasks/:taskId/sheets/',
    isAuthenticated,
    employeeDailyTaskSheetUpdateValidationRules(),
    validate,
    updateEmployeeSelfDailyTaskSheet
);