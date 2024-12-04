const {body, param} = require('express-validator');
const {ScrubNurseCaseItem, ScrubNurseCase} = require("../../models");

const scrubNurseCaseItemCreationValidationRules = () => {
    return [
        param('scrubNurseCaseId')
            .notEmpty()
            .isInt()
            .custom(async (scrubNurseCaseId) => {
                const scrubNurseCase = await ScrubNurseCase.findByPk(scrubNurseCaseId);
                if (!scrubNurseCase) {
                    throw new Error('ScrubNurse case is not found');
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

const scrubNurseCaseItemBatchCreationValidationRules = () => {
    return [
        param('scrubNurseCaseId')
            .notEmpty()
            .isInt()
            .custom(async (scrubNurseCaseId) => {
                const scrubNurseCase = await ScrubNurseCase.findByPk(scrubNurseCaseId);
                if (!scrubNurseCase) {
                    throw new Error('ScrubNurse case is not found');
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

const scrubNurseCaseItemUpdateValidationRules = () => {
    return [
        body('name').optional(),
        body('code').optional(),
        body('size').optional(),
        body('barcode').optional(),
        body('quantity').optional().isInt(),
        body('price').optional().isFloat(),
        scrubNurseCaseItemIdValidation,
    ];
};

const scrubNurseCaseItemIdValidation = param('scrubNurseCaseItemId')
    .notEmpty()
    .isInt()
    .custom(async (scrubNurseCaseItemId) => {
        const scrubNurseCaseItem = await ScrubNurseCaseItem.findByPk(scrubNurseCaseItemId);
        if (!scrubNurseCaseItem) {
            throw new Error('ScrubNurse case item is not found');
        }
    })
    .bail();

module.exports = {
    scrubNurseCaseItemCreationValidationRules,
    scrubNurseCaseItemUpdateValidationRules,
    scrubNurseCaseItemIdValidation,
    scrubNurseCaseItemBatchCreationValidationRules
}