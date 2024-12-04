const { body } = require('express-validator');

const employeeReportCreateValidationRules = () => {
    return [
        body('accomplishments').notEmpty(),
        body('plans').notEmpty()
    ];
};

module.exports = {
    employeeReportCreateValidationRules
};