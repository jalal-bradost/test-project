const {validate} = require("../../validations/validation");
const {
    swCaseItemCreationValidationRules,
    swCaseItemUpdateValidationRules,
    swCaseItemIdValidation
} = require("../../validations/sw/swCaseItemValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createSwCaseItem,
    updateSwCaseItem,
    deleteSwCaseItem,
    getSwCaseItems,
    getSwCaseItem
} = require("../../controllers/sw/swCaseItemController");

router.post(
    '/v1/sw/cases/:swCaseId/items',
    requirePermissions([permissionsMap.swStaff]),
    icuCaseItemCreationValidationRules(),
    validate,
    createSwCaseItem
);

router.put(
    '/v1/sw/cases/:swCaseId/items/:swCaseItemId',
    requirePermissions([permissionsMap.swStaff]),
    swCaseItemUpdateValidationRules(),
    validate,
    updateSwCaseItem
);

router.delete(
    '/v1/sw/cases/:swCaseId/items/:swCaseItemId',
    requirePermissions([permissionsMap.swStaff]),
    swCaseItemIdValidation,
    deleteSwCaseItem
);

router.get(
    '/v1/sw/cases/:swCaseId/items',
    requirePermissions([permissionsMap.swStaff]),
    getSwCaseItems
);

router.get(
    '/v1/sw/cases/:swCaseId/items/:swCaseItemId',
    requirePermissions([permissionsMap.swStaff]),
    swCaseItemIdValidation,
    getSwCaseItem
);