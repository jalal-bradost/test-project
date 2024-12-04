const { body, param } = require('express-validator');
const { DepartmentLeader } = require("../../models");

const departmentLeaderValidationRules = () => {
    return [
        body('departmentId').notEmpty().isInt(),
        body('employeeId').notEmpty().isInt(),
        departmentLeaderIdValidation,
    ];
};

const departmentLeaderIdValidation = param('departmentLeaderId')
    .optional()
    .isInt()
    .custom(async (departmentLeaderId) => {
        if (departmentLeaderId) {
            const departmentLeader = await DepartmentLeader.findByPk(departmentLeaderId);
            if (!departmentLeader) {
                throw new Error('Department Leader is not found');
            }
        }
    })
    .bail();

module.exports = {
    departmentLeaderValidationRules,
    departmentLeaderIdValidation,
};