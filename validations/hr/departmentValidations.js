const { body, param } = require('express-validator');
const { Department } = require("../../models");

const departmentValidationRules = () => {
    return [
        body('name').notEmpty(),
        departmentIdValidation,
    ];
};

const departmentIdValidation = param('departmentId')
    .optional()
    .isInt()
    .custom(async (departmentId) => {
        if (departmentId) {
            const department = await Department.findByPk(departmentId);
            if (!department) {
                throw new Error('Department is not found');
            }
        }
    })
    .bail();

module.exports = {
    departmentValidationRules,
    departmentIdValidation,
};