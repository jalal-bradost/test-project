const {body, param} = require('express-validator');
const {EmployeeTask, Employee, EmployeeTaskSheet} = require("../../../models");

const employeeTaskCreateValidationRules = () => {
    return [
        body('employeeId').notEmpty().isInt().custom(async (employeeId, {req}) => {
            const employee = await Employee.findByPk(employeeId);
            if (!employee) {
                throw new Error('Employee is not found');
            }
            req.employee = employee;
        }),
        body('name').notEmpty(),
        body('priority').isInt({min: 0, max: 2}),
        body('deadline').isISO8601().toDate(),
        body('taskPercentage').isInt({min: 0, max: 100}),
    ];
};

const employeeTaskUpdateValidationRules = () => {
    return [
        body('name').notEmpty(),
        body('deadline').isISO8601().toDate(),
        body('priority').isInt({min: 0, max: 2}),
        body('taskPercentage').isInt({min: 0, max: 100}),
        taskIdValidation
    ];
};

const employeeTaskManagerRateUpdateValidationRules = () => {
    return [
        body('managerCompletionRate').isInt({min: 0, max: 100}),
        taskIdValidation
    ];
};

const employeeTaskEmployeeRateUpdateValidationRules = () => {
    return [
        body('employeeCompletionRate').isInt({min: 0, max: 100}),
        taskIdValidation
    ];
};

const employeeTaskFreezeUpdateValidationRules = () => {
    return [
        body('freeze').isBoolean(),
        taskIdValidation
    ];
};

const employeeTaskStatusUpdateValidationRules = () => {
    return [
        body('status').isInt({min: 0, max: 2}),
        taskIdValidation
    ];
};

const taskIdValidation = param('taskId')
    .isInt()
    .custom(async (taskId, {req}) => {
        if (taskId) {
            const employeeTask = await EmployeeTask.findByPk(taskId);
            if (!employeeTask) {
                throw new Error('Employee task is not found');
            }
            req.employeeTask = employeeTask;
        }
    })
    .bail();

const employeeTaskSheetUpdateValidationRules = () => {
    return [
        param('taskId').isInt().custom(async (taskId, {req}) => {
            if (taskId) {
                const employeeTask = await EmployeeTask.findByPk(taskId);
                if (!employeeTask) {
                    throw new Error('Employee task is not found');
                }
                req.employeeTask = employeeTask;
            }
        }).bail(),
        param('sheetId').isInt().custom(async (sheetId, {req}) => {
            if (sheetId) {
                const employeeTaskSheet = await EmployeeTaskSheet.findByPk(sheetId);
                if (!employeeTaskSheet) {
                    throw new Error('Employee task sheet is not found');
                }
                req.employeeTaskSheet = employeeTaskSheet;
            }
        }).bail(),
        body('progress').optional().isInt({min: 0, max: 100}),
        body('description').optional().isString(),
        body('obstacles').optional().isString(),
    ];
};

module.exports = {
    employeeTaskCreateValidationRules,
    taskIdValidation,
    employeeTaskUpdateValidationRules,
    employeeTaskManagerRateUpdateValidationRules,
    employeeTaskEmployeeRateUpdateValidationRules,
    employeeTaskStatusUpdateValidationRules,
    employeeTaskSheetUpdateValidationRules,
    employeeTaskFreezeUpdateValidationRules
};