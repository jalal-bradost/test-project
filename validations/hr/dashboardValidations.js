const { query } = require('express-validator');

const dashboardDataValidationRules = () => {
    return [
        query('startDate').optional().isISO8601().toDate(),
        query('endDate').optional().isISO8601().toDate(),
        query('departmentId').optional().isInt(),
        query('roleId').optional().isInt(),
        query('employeeId').optional().isInt(),
        query('priority').optional().isInt({ min: 0, max: 2 }),
        query('status').optional().isInt({ min: 0, max: 2 }),
    ];
};

module.exports = {
    dashboardDataValidationRules
};