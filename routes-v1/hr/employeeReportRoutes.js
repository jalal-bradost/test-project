const { validate } = require("../../validations/validation");
const { employeeReportCreateValidationRules } = require("../../validations/hr/employeeReportValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const { createEmployeeReport, getEmployeeReports } = require("../../controllers/hr/employeeReportController");
const isAuthenticated = require("../../middlware/isAuthenticatedMiddleware");

router.post(
    '/v1/employee/reports',
    isAuthenticated,
    employeeReportCreateValidationRules(),
    validate,
    createEmployeeReport
);

router.get(
    '/v1/employee/reports',
    requirePermissions([permissionsMap.viewEmployeeReports], false),
    getEmployeeReports
);


module.exports = router;