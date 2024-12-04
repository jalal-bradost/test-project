const { body, param } = require('express-validator');
const { IcuCaseItem, IcuCase } = require("../../models");

const icuCaseItemCreationValidationRules = () => {
    return [
        body('icuCaseId')
            .notEmpty()
            .isInt()
            .custom(async (icuCaseId) => {
                const icuCase = await IcuCase.findByPk(icuCaseId);
                if (!icuCase) {
                    throw new Error('ICU case is not found');
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

const icuCaseItemUpdateValidationRules = () => {
    return [
        body('name').optional(),
        body('code').optional(),
        body('size').optional(),
        body('barcode').optional(),
        body('quantity').optional().isInt(),
        body('price').optional().isFloat(),
        icuCaseItemIdValidation,
    ];
};

const icuCaseItemIdValidation = param('icuCaseItemId')
    .notEmpty()
    .isInt()
    .custom(async (icuCaseItemId) => {
        const icuCaseItem = await IcuCaseItem.findByPk(icuCaseItemId);
        if (!icuCaseItem) {
            throw new Error('ICU case item is not found');
        }
    })
    .bail();

module.exports = {
    icuCaseItemCreationValidationRules,
    icuCaseItemUpdateValidationRules,
    icuCaseItemIdValidation,
}