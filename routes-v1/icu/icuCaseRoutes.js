const {validate} = require("../../validations/validation");
const {
    icuCaseCreationValidationRules,
    icuCaseUpdateValidationRules,
    icuCaseIdValidation
} = require("../../validations/icu/icuCaseValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createIcuCase,
    updateIcuCase,
    deleteIcuCase,
    getIcuCases,
    getIcuCase
} = require("../../controllers/icu/icuCaseController");

router.post(
    '/v1/icu/cases',
    requirePermissions([permissionsMap.icuStaff]),
    icuCaseCreationValidationRules(),
    validate,
    createIcuCase
);

router.put(
    '/v1/icu/cases/:icuCaseId',
    requirePermissions([permissionsMap.icuStaff]),
    icuCaseUpdateValidationRules(),
    validate,
    updateIcuCase
);

router.delete(
    '/v1/icu/cases/:icuCaseId',
    requirePermissions([permissionsMap.icuStaff]),
    icuCaseIdValidation,
    deleteIcuCase
);

router.get(
    '/v1/icu/cases',
    requirePermissions([permissionsMap.icuStaff]),
    getIcuCases
);

router.get(
    '/v1/icu/cases/:icuCaseId',
    requirePermissions([permissionsMap.icuStaff]),
    icuCaseIdValidation,
    getIcuCase
);