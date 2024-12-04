const { body, param } = require('express-validator');
const { EmployeeRole } = require("../../models");

const employeeRoleValidationRules = () => {
    return [
        body('name').notEmpty(),
        roleIdValidation,
    ];
};

const roleIdValidation = param('roleId')
    .optional()
    .isInt()
    .custom(async (roleId) => {
        if (roleId) {
            const employeeRole = await EmployeeRole.findByPk(roleId);
            if (!employeeRole) {
                throw new Error('Employee role is not found');
            }
        }
    })
    .bail();

module.exports = {
    employeeRoleValidationRules,
    roleIdValidation,
};