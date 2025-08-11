const {validate} = require("../../validations/validation");
const {
    cardiologyCaseItemCreationValidationRules,
    cardiologyCaseItemUpdateValidationRules,
    cardiologyCaseItemIdValidation
} = require("../../validations/cardiology/cardiologyCaseItemValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createCardiologyCaseItem,
    updateCardiologyCaseItem,
    deleteCardiologyCaseItem,
    getCardiologyCaseItems,
    getCardiologyCaseItem
} = require("../../controllers/cardiology/cardiologyCaseItemController");

router.post(
    '/v1/cardiology/cases/:cardiologyCaseId/items',
    requirePermissions([permissionsMap.cardiologyStaff]),
    cardiologyCaseItemCreationValidationRules(),
    validate,
    createCardiologyCaseItem
);

router.put(
    '/v1/cardiology/cases/:cardiologyCaseId/items/:cardiologyCaseItemId',
    requirePermissions([permissionsMap.cardiologyStaff]),
    cardiologyCaseItemUpdateValidationRules(),
    validate,
    updateCardiologyCaseItem
);

router.delete(
    '/v1/cardiology/cases/:cardiologyCaseId/items/:cardiologyCaseItemId',
    requirePermissions([permissionsMap.cardiologyStaff]),
    cardiologyCaseItemIdValidation,
    deleteCardiologyCaseItem
);

router.get(
    '/v1/cardiology/cases/:cardiologyCaseId/items',
    requirePermissions([permissionsMap.cardiologyStaff]),
    getCardiologyCaseItems
);

router.get(
    '/v1/cardiology/cases/:cardiologyCaseId/items/:cardiologyCaseItemId',
    requirePermissions([permissionsMap.cardiologyStaff]),
    cardiologyCaseItemIdValidation,
    getCardiologyCaseItem
);