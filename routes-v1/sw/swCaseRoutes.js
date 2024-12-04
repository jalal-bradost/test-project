const {validate} = require("../../validations/validation");
const {
    swCaseCreationValidationRules,
    swCaseUpdateValidationRules,
    swCaseIdValidation
} = require("../../validations/sw/swCaseValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createSwCase,
    updateSwCase,
    deleteSwCase,
    getSwCases,
    getSwCase
} = require("../../controllers/sw/swCaseController");

router.post(
    '/v1/sw/cases',
    requirePermissions([permissionsMap.swStaff]),
    swCaseCreationValidationRules(),
    validate,
    createSwCase
);

router.put(
    '/v1/sw/cases/:swCaseId',
    requirePermissions([permissionsMap.swStaff]),
    swCaseUpdateValidationRules(),
    validate,
    updateSwCase
);

router.delete(
    '/v1/sw/cases/:swCaseId',
    requirePermissions([permissionsMap.swStaff]),
    swCaseIdValidation,
    deleteSwCase
);

router.get(
    '/v1/sw/cases',
    requirePermissions([permissionsMap.swStaff]),
    getSwCases
);

router.get(
    '/v1/sw/cases/:swCaseId',
    requirePermissions([permissionsMap.swStaff]),
    swCaseIdValidation,
    getSwCase
);