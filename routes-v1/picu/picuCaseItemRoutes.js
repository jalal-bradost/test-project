const {validate} = require("../../validations/validation");
const {
    picuCaseItemUpdateValidationRules, picuCaseItemBatchCreationValidationRules,
    picuCaseItemIdValidation, picuCaseItemCreationValidationRules
} = require("../../validations/picu/picuCaseItemValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createPicuCaseItem,
    updatePicuCaseItem,
    deletePicuCaseItem,
    getPicuCaseItems,
    getPicuCaseItem,
    createBatchPicuCaseItem
} = require("../../controllers/picu/picuCaseItemController");

router.post(
    '/v1/picu/cases/:picuCaseId/items',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseItemCreationValidationRules(),
    validate,
    createPicuCaseItem
);

router.post(
    '/v1/picu/cases/:picuCaseId/items/batch',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseItemBatchCreationValidationRules(),
    validate,
    createBatchPicuCaseItem
);

router.put(
    '/v1/picu/cases/:picuCaseId/items/:picuCaseItemId',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseItemUpdateValidationRules(),
    validate,
    updatePicuCaseItem
);

router.delete(
    '/v1/picu/cases/:picuCaseId/items/:picuCaseItemId',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseItemIdValidation,
    deletePicuCaseItem
);

router.get(
    '/v1/picu/cases/:picuCaseId/items',
    requirePermissions([permissionsMap.picuStaff]),
    getPicuCaseItems
);

router.get(
    '/v1/picu/cases/:picuCaseId/items/:picuCaseItemId',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseItemIdValidation,
    getPicuCaseItem
);