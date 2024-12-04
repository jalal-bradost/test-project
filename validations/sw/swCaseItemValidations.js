const { body, param } = require('express-validator');
const { SwCaseItem, SwCase } = require("../../models");

const swCaseItemCreationValidationRules = () => {
    return [
        body('swCaseId')
            .notEmpty()
            .isInt()
            .custom(async (swCaseId) => {
                const swCase = await SwCase.findByPk(swCaseId);
                if (!swCase) {
                    throw new Error('SW case is not found');
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

const swCaseItemUpdateValidationRules = () => {
    return [
        body('name').optional(),
        body('code').optional(),
        body('size').optional(),
        body('barcode').optional(),
        body('quantity').optional().isInt(),
        body('price').optional().isFloat(),
        swCaseItemIdValidation,
    ];
};

const swCaseItemIdValidation = param('swCaseItemId')
    .notEmpty()
    .isInt()
    .custom(async (swCaseItemId) => {
        const swCaseItem = await SwCaseItem.findByPk(swCaseItemId);
        if (!swCaseItem) {
            throw new Error('SW case item is not found');
        }
    })
    .bail();

module.exports = {
    swCaseItemCreationValidationRules,
    swCaseItemUpdateValidationRules,
    swCaseItemIdValidation,
}