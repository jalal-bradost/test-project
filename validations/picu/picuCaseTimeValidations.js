const {body, param} = require('express-validator');
const {PicuCaseTime, PicuCase, PicuTime} = require("../../models");

const picuCaseTimeCreationValidationRules = () => {
    return [
        param('picuCaseId').notEmpty().isInt().custom(async (picuCaseId) => {
            const picuCase = await PicuCase.findByPk(picuCaseId);
            if (!picuCase) {
                throw new Error('PICU case is not found');
            }
        }),
        body('picuTimeId').notEmpty().isInt().custom(async (picuTimeId) => {
            const picuTime = await PicuTime.findByPk(picuTimeId);
            if (!picuTime) {
                throw new Error('PICU time is not found');
            }
        }),
        body('entryTime').notEmpty().isISO8601().toDate(),
        body('exitTime').optional({values: 'null'}).isISO8601().toDate(),
    ];
};

const picuCaseTimeUpdateValidationRules = () => {
    return [
        param('picuCaseId').notEmpty().isInt().custom(async (picuCaseId) => {
            const picuCase = await PicuCase.findByPk(picuCaseId);
            if (!picuCase) {
                throw new Error('PICU case is not found');
            }
        }),
        param('picuCaseTimeId').notEmpty().isInt().custom(async (picuCaseTimeId) => {
            const picuCaseTime = await PicuCaseTime.findByPk(picuCaseTimeId);
            if (!picuCaseTime) {
                throw new Error('PICU case time is not found');
            }
        }),
        body('picuTimeId').notEmpty().isInt().custom(async (picuTimeId) => {
            const picuTime = await PicuTime.findByPk(picuTimeId);
            if (!picuTime) {
                throw new Error('PICU time is not found');
            }
        }),
        body('entryTime').notEmpty().isISO8601().toDate(),
        body('exitTime').optional({values: 'null'}).isISO8601().toDate(),
        picuCaseTimeIdValidation
    ];
};

const picuCaseTimeIdValidation = param('picuCaseTimeId')
    .notEmpty()
    .isInt()
    .custom(async (picuCaseTimeId) => {
        const picuCaseTime = await PicuCaseTime.findByPk(picuCaseTimeId);
        if (!picuCaseTime) {
            throw new Error('PICU time is not found');
        }
    })
    .bail();

module.exports = {
    picuCaseTimeCreationValidationRules,
    picuCaseTimeUpdateValidationRules,
    picuCaseTimeIdValidation,
}