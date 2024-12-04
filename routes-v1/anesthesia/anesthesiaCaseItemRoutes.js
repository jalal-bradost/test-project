const {validate} = require("../../validations/validation");
const {
    anesthesiaCaseItemUpdateValidationRules, anesthesiaCaseItemBatchCreationValidationRules,
    anesthesiaCaseItemIdValidation, anesthesiaCaseItemCreationValidationRules
} = require("../../validations/anesthesia/anesthesiaCaseItemValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createAnesthesiaCaseItem,
    updateAnesthesiaCaseItem,
    deleteAnesthesiaCaseItem,
    getAnesthesiaCaseItems,
    getAnesthesiaCaseItem,
    createBatchAnesthesiaCaseItem
} = require("../../controllers/anesthesia/anesthesiaCaseItemController");

router.post(
    '/v1/anesthesia/cases/:anesthesiaCaseId/items',
    requirePermissions([permissionsMap.anesthesiaStaff]),
    anesthesiaCaseItemCreationValidationRules(),
    validate,
    createAnesthesiaCaseItem
);

router.post(
    '/v1/anesthesia/cases/:anesthesiaCaseId/items/batch',
    requirePermissions([permissionsMap.anesthesiaStaff]),
    anesthesiaCaseItemBatchCreationValidationRules(),
    validate,
    createBatchAnesthesiaCaseItem
);

router.put(
    '/v1/anesthesia/cases/:anesthesiaCaseId/items/:anesthesiaCaseItemId',
    requirePermissions([permissionsMap.anesthesiaStaff]),
    anesthesiaCaseItemUpdateValidationRules(),
    validate,
    updateAnesthesiaCaseItem
);

router.delete(
    '/v1/anesthesia/cases/:anesthesiaCaseId/items/:anesthesiaCaseItemId',
    requirePermissions([permissionsMap.anesthesiaStaff]),
    anesthesiaCaseItemIdValidation,
    deleteAnesthesiaCaseItem
);

router.get(
    '/v1/anesthesia/cases/:anesthesiaCaseId/items',
    requirePermissions([permissionsMap.anesthesiaStaff]),
    getAnesthesiaCaseItems
);

router.get(
    '/v1/anesthesia/cases/:anesthesiaCaseId/items/:anesthesiaCaseItemId',
    requirePermissions([permissionsMap.anesthesiaStaff]),
    anesthesiaCaseItemIdValidation,
    getAnesthesiaCaseItem
);