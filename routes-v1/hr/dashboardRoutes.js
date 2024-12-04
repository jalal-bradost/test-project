// src/routes/hr/dashboard/dashboardRoutes.js

const router = require("../../config/express");
const { validate } = require("../../validations/validation");
const { dashboardDataValidationRules } = require("../../validations/hr/dashboardValidations");
const { getDashboardData } = require("../../controllers/hr/dashboardController");
const isAuthenticated = require("../../middlware/isAuthenticatedMiddleware");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");

router.get(
    '/v1/hr/dashboard',
    isAuthenticated,
    requirePermissions([permissionsMap.humanResources]),
    dashboardDataValidationRules(),
    validate,
    getDashboardData
);

module.exports = router;