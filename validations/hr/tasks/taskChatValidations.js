const {body, param} = require('express-validator');
const {EmployeeTask} = require("../../../models");

const taskChatCreationValidationRules = () => {
    return [
        body('content')
            .notEmpty()
            .isString(),
        taskIdValidation
    ];
};

const taskAudioChatCreationValidationRules = () => {
    return [
        body('file')
            .notEmpty(),
        taskIdValidation
    ];
};

const taskFileChatCreationValidationRules = () => {
    return [
        body('file')
            .notEmpty(),
        taskIdValidation
    ];
};

const taskIdValidation = param("taskId")
    .notEmpty()
    .isInt()
    .custom(async taskId => {
        const task = await EmployeeTask.findByPk(taskId);
        if (!task) {
            throw new Error("Task not found")
        }
    })
    .bail();

module.exports = {
    taskIdValidation,
    taskChatCreationValidationRules,
    taskAudioChatCreationValidationRules,
    taskFileChatCreationValidationRules
};