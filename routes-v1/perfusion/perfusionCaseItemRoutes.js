const {validate} = require("../../validations/validation");
const {
    perfusionCaseItemUpdateValidationRules, perfusionCaseItemBatchCreationValidationRules,
    perfusionCaseItemIdValidation, perfusionCaseItemCreationValidationRules
} = require("../../validations/perfusion/perfusionCaseItemValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createPerfusionCaseItem,
    updatePerfusionCaseItem,
    deletePerfusionCaseItem,
    getPerfusionCaseItems,
    getPerfusionCaseItem,
    createBatchPerfusionCaseItem
} = require("../../controllers/perfusion/perfusionCaseItemController");

router.post(
    '/v1/perfusion/cases/:perfusionCaseId/items',
    requirePermissions([permissionsMap.perfusionStaff]),
    perfusionCaseItemCreationValidationRules(),
    validate,
    createPerfusionCaseItem
);

router.post(
    '/v1/perfusion/cases/:perfusionCaseId/items/batch',
    requirePermissions([permissionsMap.perfusionStaff]),
    perfusionCaseItemBatchCreationValidationRules(),
    validate,
    createBatchPerfusionCaseItem
);

router.put(
    '/v1/perfusion/cases/:perfusionCaseId/items/:perfusionCaseItemId',
    requirePermissions([permissionsMap.perfusionStaff]),
    perfusionCaseItemUpdateValidationRules(),
    validate,
    updatePerfusionCaseItem
);

router.delete(
    '/v1/perfusion/cases/:perfusionCaseId/items/:perfusionCaseItemId',
    requirePermissions([permissionsMap.perfusionStaff]),
    perfusionCaseItemIdValidation,
    deletePerfusionCaseItem
);

router.get(
    '/v1/perfusion/cases/:perfusionCaseId/items',
    requirePermissions([permissionsMap.perfusionStaff]),
    getPerfusionCaseItems
);

router.get(
    '/v1/perfusion/cases/:perfusionCaseId/items/:perfusionCaseItemId',
    requirePermissions([permissionsMap.perfusionStaff]),
    perfusionCaseItemIdValidation,
    getPerfusionCaseItem
);