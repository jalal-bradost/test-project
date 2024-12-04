const {body, param} = require('express-validator');
const {PerfusionCaseItem, PerfusionCase} = require("../../models");

const perfusionCaseItemCreationValidationRules = () => {
    return [
        param('perfusionCaseId')
            .notEmpty()
            .isInt()
            .custom(async (perfusionCaseId) => {
                const perfusionCase = await PerfusionCase.findByPk(perfusionCaseId);
                if (!perfusionCase) {
                    throw new Error('Perfusion case is not found');
                }
            }),
        body('name').notEmpty(),
        body('code').optional(),
        body('size').optional(),
        body('barcode').notEmpty(),
        body('quantity').notEmpty().isInt(),
        body('price').notEmpty().isFloat(),
    ];
};

const perfusionCaseItemBatchCreationValidationRules = () => {
    return [
        param('perfusionCaseId')
            .notEmpty()
            .isInt()
            .custom(async (perfusionCaseId) => {
                const perfusionCase = await PerfusionCase.findByPk(perfusionCaseId);
                if (!perfusionCase) {
                    throw new Error('Perfusion case is not found');
                }
            }),
        body('*.name').notEmpty(),
        body('*.code').optional(),
        body('*.size').optional(),
        body('*.barcode').notEmpty(),
        body('*.quantity').notEmpty().isInt(),
        body('*.price').notEmpty().isFloat(),
    ];
};

const perfusionCaseItemUpdateValidationRules = () => {
    return [
        body('name').optional(),
        body('code').optional(),
        body('size').optional(),
        body('barcode').optional(),
        body('quantity').optional().isInt(),
        body('price').optional().isFloat(),
        perfusionCaseItemIdValidation,
    ];
};

const perfusionCaseItemIdValidation = param('perfusionCaseItemId')
    .notEmpty()
    .isInt()
    .custom(async (perfusionCaseItemId) => {
        const perfusionCaseItem = await PerfusionCaseItem.findByPk(perfusionCaseItemId);
        if (!perfusionCaseItem) {
            throw new Error('Perfusion case item is not found');
        }
    })
    .bail();

module.exports = {
    perfusionCaseItemCreationValidationRules,
    perfusionCaseItemUpdateValidationRules,
    perfusionCaseItemIdValidation,
    perfusionCaseItemBatchCreationValidationRules
}