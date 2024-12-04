const { body, param } = require('express-validator');
const { SurgeryType } = require("../../models");

const surgeryTypeValidationRules = () => {
    return [
        body('name').notEmpty(),
        surgeryTypeIdValidation,
    ];
};

const surgeryTypeIdValidation = param('surgeryTypeId')
    .optional()
    .isInt()
    .custom(async (surgeryTypeId) => {
        if (surgeryTypeId) {
            const surgeryType = await SurgeryType.findByPk(surgeryTypeId);
            if (!surgeryType) {
                throw new Error('SurgeryType is not found');
            }
        }
    })
    .bail();

module.exports = {
    surgeryTypeValidationRules,
    surgeryTypeIdValidation,
};