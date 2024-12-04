const {body, param} = require('express-validator');
const {Employee, EmployeeRole, User, Department} = require("../../models");

const employeeCreationValidationRules = () => {
    return [
        body('firstName').notEmpty(),
        body('middleName').notEmpty(),
        body('lastName').notEmpty(),
        body('phoneNumber').notEmpty(),
        // body('email').optional().isEmail(),
        // body('address').optional(),
        // body('nationality').notEmpty(),
        // body('bloodType').notEmpty(),
        // body('dateOfBirth').notEmpty().isDate(),
        body('roleId')
            .notEmpty()
            .isInt()
            .custom(async (roleId) => {
                const role = await EmployeeRole.findByPk(roleId);
                if (!role) {
                    throw new Error('Role is not found');
                }
            }),
        body('departmentId')
            .notEmpty()
            .isInt()
            .custom(async (departmentId) => {
                const department = await Department.findByPk(departmentId);
                if (!department) {
                    throw new Error('Department is not found');
                }
            }),
        body('userId')
            .optional()
            .custom(async (userId) => {
                if (userId) {
                    const user = await User.findByPk(userId);
                    if (!user) {
                        throw new Error('User is not found');
                    }
                }
            }),
        body('salary').notEmpty().isFloat(),
        // body('bonus').optional().isFloat(),
        // body('nationalCardImage').optional(),
        // body('infoCardImage').optional(),
        // body('agreementCopyImage').optional(),
    ];
};

const employeeModificationValidationRules = () => {
    return [
        body('firstName').optional(),
        body('middleName').notEmpty(),
        body('lastName').optional(),
        body('phoneNumber').notEmpty(),
        // body('email').optional().isEmail(),
        // body('address').optional(),
        // body('nationality').optional(),
        // body('bloodType').optional(),
        // body('dateOfBirth').optional().isDate(),
        body('roleId')
            .optional()
            .isInt()
            .custom(async (roleId) => {
                if (roleId) {
                    const role = await EmployeeRole.findByPk(roleId);
                    if (!role) {
                        throw new Error('Role is not found');
                    }
                }
            }),
        body('departmentId')
            .optional()
            .isInt()
            .custom(async (departmentId) => {
                if (departmentId) {
                    const department = await Department.findByPk(departmentId);
                    if (!department) {
                        throw new Error('Department is not found');
                    }
                }
            }),
        body('userId')
            .optional()
            .custom(async (userId) => {
                if (userId) {
                    const user = await User.findByPk(userId);
                    if (!user) {
                        throw new Error('User is not found');
                    }
                }
            }),
        body('salary').optional().isFloat(),
        // body('bonus').optional().isFloat(),
        // body('nationalCardImage').optional(),
        // body('infoCardImage').optional(),
        // body('agreementCopyImage').optional(),
        employeeIdValidation,
    ];
};

const employeeDeletionValidationRules = () => {
    return [employeeIdValidation];
};

const employeeIdValidation = param('employeeId')
    .notEmpty()
    .isInt()
    .custom(async (employeeId, {req}) => {
        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            throw new Error('Employee is not found');
        }
        req.employee = employee;
    })
    .bail();

module.exports = {
    employeeCreationValidationRules,
    employeeModificationValidationRules,
    employeeDeletionValidationRules,
    employeeIdValidation,
}