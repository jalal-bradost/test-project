const {body, param} = require('express-validator');
const {PicuService} = require("../../models");

const picuServiceCreationValidationRules = () => {
    return [
        body('name').notEmpty().isString()
    ];
};

const picuServiceUpdateValidationRules = () => {
    return [
        body('name').notEmpty().isString(),
        picuServiceIdValidation
    ];
};

const picuServiceIdValidation = param('picuServiceId')
    .notEmpty()
    .isInt()
    .custom(async (picuServiceId) => {
        const picuService = await PicuService.findByPk(picuServiceId);
        if (!picuService) {
            throw new Error('PICU service is not found');
        }
    })
    .bail();

module.exports = {
    picuServiceCreationValidationRules,
    picuServiceUpdateValidationRules,
    picuServiceIdValidation,
}