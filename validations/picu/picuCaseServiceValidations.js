const {body, param} = require('express-validator');
const {PicuCaseService, PicuCase, PicuService} = require("../../models");

const picuCaseServiceCreationValidationRules = () => {
    return [
        param('picuCaseId').notEmpty().isInt().custom(async (picuCaseId) => {
            const picuCase = await PicuCase.findByPk(picuCaseId);
            if (!picuCase) {
                throw new Error('PICU case is not found');
            }
        }),
        body('picuServiceId').notEmpty().isInt().custom(async (picuServiceId) => {
            const picuService = await PicuService.findByPk(picuServiceId);
            if (!picuService) {
                throw new Error('PICU service is not found');
            }
        }),
    ];
};

const picuCaseServiceUpdateValidationRules = () => {
    return [
        param('picuCaseId').notEmpty().isInt().custom(async (picuCaseId) => {
            const picuCase = await PicuCase.findByPk(picuCaseId);
            if (!picuCase) {
                throw new Error('PICU case is not found');
            }
        }),
        body('picuServiceId').notEmpty().isInt().custom(async (picuServiceId) => {
            const picuService = await PicuService.findByPk(picuServiceId);
            if (!picuService) {
                throw new Error('PICU service is not found');
            }
        }), picuCaseServiceIdValidation
    ];
};

const picuCaseServiceIdValidation = param('picuCaseServiceId')
    .notEmpty()
    .isInt()
    .custom(async (picuCaseServiceId) => {
        const picuCaseService = await PicuCaseService.findByPk(picuCaseServiceId);
        if (!picuCaseService) {
            throw new Error('PICU service is not found');
        }
    })
    .bail();

module.exports = {
    picuCaseServiceCreationValidationRules,
    picuCaseServiceUpdateValidationRules,
    picuCaseServiceIdValidation,
}