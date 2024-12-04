const {validate} = require("../../validations/validation");
const {
    scrubNurseCaseCreationValidationRules,
    scrubNurseCaseUpdateValidationRules,
    scrubNurseCaseIdValidation
} = require("../../validations/scrubNurse/scrubNurseCaseValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createScrubNurseCase,
    updateScrubNurseCase,
    deleteScrubNurseCase,
    getScrubNurseCases,
    getScrubNurseCase
} = require("../../controllers/scrubNurse/scrubNurseCaseController");

router.post(
    '/v1/scrub-nurse/cases',
    requirePermissions([permissionsMap.scrubNurseStaff]),
    scrubNurseCaseCreationValidationRules(),
    validate,
    createScrubNurseCase
);

router.put(
    '/v1/scrub-nurse/cases/:scrubNurseCaseId',
    requirePermissions([permissionsMap.scrubNurseStaff]),
    scrubNurseCaseUpdateValidationRules(),
    validate,
    updateScrubNurseCase
);

router.delete(
    '/v1/scrub-nurse/cases/:scrubNurseCaseId',
    requirePermissions([permissionsMap.scrubNurseStaff]),
    scrubNurseCaseIdValidation,
    deleteScrubNurseCase
);

router.get(
    '/v1/scrub-nurse/cases',
    requirePermissions([permissionsMap.scrubNurseStaff]),
    getScrubNurseCases
);

router.get(
    '/v1/scrub-nurse/cases/:scrubNurseCaseId',
    requirePermissions([permissionsMap.scrubNurseStaff]),
    scrubNurseCaseIdValidation,
    getScrubNurseCase
);