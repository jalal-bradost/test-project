const {body, param} = require('express-validator');
const {EmployeeFeedback, Employee} = require("../../models");

const employeeFeedbackCreateValidationRules = () => {
    return [
        body('employeeId').notEmpty().isInt().custom(async (employeeId) => {
            const employee = await Employee.findByPk(employeeId);
            if (!employee) {
                throw new Error('Employee is not found');
            }
        }),
        body('typeId').isInt(),
        body('reason').notEmpty().isString()
    ];
};

const feedbackIdValidation = param('feedbackId')
    .isInt()
    .custom(async (feedbackId) => {
        if (feedbackId) {
            const employeeFeedback = await EmployeeFeedback.findByPk(feedbackId);
            if (!employeeFeedback) {
                throw new Error('Employee feedback is not found');
            }
        }
    })
    .bail();

module.exports = {
    employeeFeedbackCreateValidationRules,
    feedbackIdValidation,
};