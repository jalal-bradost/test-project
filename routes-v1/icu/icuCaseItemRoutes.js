const {validate} = require("../../validations/validation");
const {
    icuCaseItemCreationValidationRules,
    icuCaseItemUpdateValidationRules,
    icuCaseItemIdValidation
} = require("../../validations/icu/icuCaseItemValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createIcuCaseItem,
    updateIcuCaseItem,
    deleteIcuCaseItem,
    getIcuCaseItems,
    getIcuCaseItem
} = require("../../controllers/icu/icuCaseItemController");

router.post(
    '/v1/icu/cases/:icuCaseId/items',
    requirePermissions([permissionsMap.icuStaff]),
    icuCaseItemCreationValidationRules(),
    validate,
    createIcuCaseItem
);

router.put(
    '/v1/icu/cases/:icuCaseId/items/:icuCaseItemId',
    requirePermissions([permissionsMap.icuStaff]),
    icuCaseItemUpdateValidationRules(),
    validate,
    updateIcuCaseItem
);

router.delete(
    '/v1/icu/cases/:icuCaseId/items/:icuCaseItemId',
    requirePermissions([permissionsMap.icuStaff]),
    icuCaseItemIdValidation,
    deleteIcuCaseItem
);

router.get(
    '/v1/icu/cases/:icuCaseId/items',
    requirePermissions([permissionsMap.icuStaff]),
    getIcuCaseItems
);

router.get(
    '/v1/icu/cases/:icuCaseId/items/:icuCaseItemId',
    requirePermissions([permissionsMap.icuStaff]),
    icuCaseItemIdValidation,
    getIcuCaseItem
);