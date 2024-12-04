const {body, param} = require('express-validator');
const {AnesthesiaCaseItem, AnesthesiaCase} = require("../../models");

const anesthesiaCaseItemCreationValidationRules = () => {
    return [
        param('anesthesiaCaseId')
            .notEmpty()
            .isInt()
            .custom(async (anesthesiaCaseId) => {
                const anesthesiaCase = await AnesthesiaCase.findByPk(anesthesiaCaseId);
                if (!anesthesiaCase) {
                    throw new Error('Anesthesia case is not found');
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

const anesthesiaCaseItemBatchCreationValidationRules = () => {
    return [
        param('anesthesiaCaseId')
            .notEmpty()
            .isInt()
            .custom(async (anesthesiaCaseId) => {
                const anesthesiaCase = await AnesthesiaCase.findByPk(anesthesiaCaseId);
                if (!anesthesiaCase) {
                    throw new Error('Anesthesia case is not found');
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

const anesthesiaCaseItemUpdateValidationRules = () => {
    return [
        body('name').optional(),
        body('code').optional(),
        body('size').optional(),
        body('barcode').optional(),
        body('quantity').optional().isInt(),
        body('price').optional().isFloat(),
        anesthesiaCaseItemIdValidation,
    ];
};

const anesthesiaCaseItemIdValidation = param('anesthesiaCaseItemId')
    .notEmpty()
    .isInt()
    .custom(async (anesthesiaCaseItemId) => {
        const anesthesiaCaseItem = await AnesthesiaCaseItem.findByPk(anesthesiaCaseItemId);
        if (!anesthesiaCaseItem) {
            throw new Error('Anesthesia case item is not found');
        }
    })
    .bail();

module.exports = {
    anesthesiaCaseItemCreationValidationRules,
    anesthesiaCaseItemUpdateValidationRules,
    anesthesiaCaseItemIdValidation,
    anesthesiaCaseItemBatchCreationValidationRules
}