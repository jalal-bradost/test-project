const {body, param} = require('express-validator');
const {PicuCaseItem, PicuCase} = require("../../models");

const picuCaseItemCreationValidationRules = () => {
    return [
        param('picuCaseId')
            .notEmpty()
            .isInt()
            .custom(async (picuCaseId) => {
                const picuCase = await PicuCase.findByPk(picuCaseId);
                if (!picuCase) {
                    throw new Error('PICU case is not found');
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

const picuCaseItemBatchCreationValidationRules = () => {
    return [
        param('picuCaseId')
            .notEmpty()
            .isInt()
            .custom(async (picuCaseId) => {
                const picuCase = await PicuCase.findByPk(picuCaseId);
                if (!picuCase) {
                    throw new Error('PICU case is not found');
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

const picuCaseItemUpdateValidationRules = () => {
    return [
        body('name').optional(),
        body('code').optional(),
        body('size').optional(),
        body('barcode').optional(),
        body('quantity').optional().isInt(),
        body('price').optional().isFloat(),
        picuCaseItemIdValidation,
    ];
};

const picuCaseItemIdValidation = param('picuCaseItemId')
    .notEmpty()
    .isInt()
    .custom(async (picuCaseItemId) => {
        const picuCaseItem = await PicuCaseItem.findByPk(picuCaseItemId);
        if (!picuCaseItem) {
            throw new Error('PICU case item is not found');
        }
    })
    .bail();

module.exports = {
    picuCaseItemCreationValidationRules,
    picuCaseItemUpdateValidationRules,
    picuCaseItemIdValidation,
    picuCaseItemBatchCreationValidationRules
}