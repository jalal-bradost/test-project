const {body, param} = require('express-validator');
const {EmployeeDailyTask, Employee, EmployeeDailyTaskSheet} = require("../../../models");

const employeeDailyTaskCreateValidationRules = () => {
    return [
        body('employeeId').notEmpty().isInt().custom(async (employeeId, {req}) => {
            const employee = await Employee.findByPk(employeeId);
            if (!employee) {
                throw new Error('Employee is not found');
            }
            req.employee = employee;
        }),
        body('name').notEmpty(),
        body('taskPercentage').isInt({min: 0, max: 100}),
    ];
};

const employeeDailyTaskUpdateValidationRules = () => {
    return [
        body('name').notEmpty(),
        body('taskPercentage').isInt({min: 0, max: 100}),
        taskIdValidation
    ];
};

const employeeDailyTaskManagerRateUpdateValidationRules = () => {
    return [
        body('managerCompletionRate').isInt({min: 0, max: 100}),
        taskIdValidation
    ];
};

const taskIdValidation = param('taskId')
    .isInt()
    .custom(async (taskId, {req}) => {
        if (taskId) {
            const employeeDailyTask = await EmployeeDailyTask.findByPk(taskId);
            if (!employeeDailyTask) {
                throw new Error('Employee dailyTask is not found');
            }
            req.employeeDailyTask = employeeDailyTask;
        }
    })
    .bail();

const employeeDailyTaskSheetUpdateValidationRules = () => {
    return [
        param('taskId').isInt().custom(async (taskId, {req}) => {
            if (taskId) {
                const employeeDailyTask = await EmployeeDailyTask.findByPk(taskId);
                if (!employeeDailyTask) {
                    throw new Error('Employee dailyTask is not found');
                }
                req.employeeDailyTask = employeeDailyTask;
            }
        }).bail(),
        // param('sheetId').isInt().custom(async (sheetId, {req}) => {
        //     if (sheetId) {
        //         const employeeDailyTaskSheet = await EmployeeDailyTaskSheet.findByPk(sheetId);
        //         if (!employeeDailyTaskSheet) {
        //             throw new Error('Employee dailyTask sheet is not found');
        //         }
        //         req.employeeDailyTaskSheet = employeeDailyTaskSheet;
        //     }
        // }).bail(),
        body('progress').optional().isInt({min: 0, max: 100}),
        body('description').optional().isString(),
        body('obstacles').optional().isString(),
    ];
};

module.exports = {
    employeeDailyTaskCreateValidationRules,
    taskIdValidation,
    employeeDailyTaskUpdateValidationRules,
    employeeDailyTaskManagerRateUpdateValidationRules,
    employeeDailyTaskSheetUpdateValidationRules
};