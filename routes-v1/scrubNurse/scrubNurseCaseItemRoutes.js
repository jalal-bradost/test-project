const {validate} = require("../../validations/validation");
const {
    scrubNurseCaseItemUpdateValidationRules, scrubNurseCaseItemBatchCreationValidationRules,
    scrubNurseCaseItemIdValidation, scrubNurseCaseItemCreationValidationRules
} = require("../../validations/scrubNurse/scrubNurseCaseItemValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createScrubNurseCaseItem,
    updateScrubNurseCaseItem,
    deleteScrubNurseCaseItem,
    getScrubNurseCaseItems,
    getScrubNurseCaseItem,
    createBatchScrubNurseCaseItem
} = require("../../controllers/scrubNurse/scrubNurseCaseItemController");

router.post(
    '/v1/scrub-nurse/cases/:scrubNurseCaseId/items',
    requirePermissions([permissionsMap.scrubNurseStaff]),
    scrubNurseCaseItemCreationValidationRules(),
    validate,
    createScrubNurseCaseItem
);

router.post(
    '/v1/scrub-nurse/cases/:scrubNurseCaseId/items/batch',
    requirePermissions([permissionsMap.scrubNurseStaff]),
    scrubNurseCaseItemBatchCreationValidationRules(),
    validate,
    createBatchScrubNurseCaseItem
);

router.put(
    '/v1/scrub-nurse/cases/:scrubNurseCaseId/items/:scrubNurseCaseItemId',
    requirePermissions([permissionsMap.scrubNurseStaff]),
    scrubNurseCaseItemUpdateValidationRules(),
    validate,
    updateScrubNurseCaseItem
);

router.delete(
    '/v1/scrub-nurse/cases/:scrubNurseCaseId/items/:scrubNurseCaseItemId',
    requirePermissions([permissionsMap.scrubNurseStaff]),
    scrubNurseCaseItemIdValidation,
    deleteScrubNurseCaseItem
);

router.get(
    '/v1/scrubNurse/cases/:scrubNurseCaseId/items',
    requirePermissions([permissionsMap.scrubNurseStaff]),
    getScrubNurseCaseItems
);

router.get(
    '/v1/scrubNurse/cases/:scrubNurseCaseId/items/:scrubNurseCaseItemId',
    requirePermissions([permissionsMap.scrubNurseStaff]),
    scrubNurseCaseItemIdValidation,
    getScrubNurseCaseItem
);