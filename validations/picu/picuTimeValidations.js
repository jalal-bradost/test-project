const {body, param} = require('express-validator');
const {PicuTime} = require("../../models");

const picuTimeCreationValidationRules = () => {
    return [
        body('name').notEmpty().isString()
    ];
};

const picuTimeUpdateValidationRules = () => {
    return [
        body('name').notEmpty().isString(),
        picuTimeIdValidation
    ];
};

const picuTimeIdValidation = param('picuTimeId')
    .notEmpty()
    .isInt()
    .custom(async (picuTimeId) => {
        const picuTime = await PicuTime.findByPk(picuTimeId);
        if (!picuTime) {
            throw new Error('PICU time is not found');
        }
    })
    .bail();

module.exports = {
    picuTimeCreationValidationRules,
    picuTimeUpdateValidationRules,
    picuTimeIdValidation,
}