const { body, param } = require('express-validator');
const { CardiologyCaseItem, CardiologyCase } = require("../../models");

const cardiologyCaseItemCreationValidationRules = () => {
    return [
        body('cardiologyCaseId')
            .notEmpty()
            .isInt()
            .custom(async (cardiologyCaseId) => {
                const cardiologyCase = await CardiologyCase.findByPk(cardiologyCaseId);
                if (!cardiologyCase) {
                    throw new Error('Cardiology case is not found');
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

const cardiologyCaseItemUpdateValidationRules = () => {
    return [
        body('name').optional(),
        body('code').optional(),
        body('size').optional(),
        body('barcode').optional(),
        body('quantity').optional().isInt(),
        body('price').optional().isFloat(),
        cardiologyCaseItemIdValidation,
    ];
};

const cardiologyCaseItemIdValidation = param('cardiologyCaseItemId')
    .notEmpty()
    .isInt()
    .custom(async (cardiologyCaseItemId) => {
        const cardiologyCaseItem = await CardiologyCaseItem.findByPk(cardiologyCaseItemId);
        if (!CardiologyCaseItem) {
            throw new Error('Cardiology case item is not found');
        }
    })
    .bail();

module.exports = {
    cardiologyCaseItemCreationValidationRules,
    cardiologyCaseItemUpdateValidationRules,
    cardiologyCaseItemIdValidation,
}