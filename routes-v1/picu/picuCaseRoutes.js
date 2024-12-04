const {validate} = require("../../validations/validation");
const {
    picuCaseCreationValidationRules,
    picuCaseUpdateValidationRules,
    picuCaseIdValidation
} = require("../../validations/picu/picuCaseValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createPicuCase,
    updatePicuCase,
    deletePicuCase,
    getPicuCases,
    getPicuCase
} = require("../../controllers/picu/picuCaseController");

router.post(
    '/v1/picu/cases',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseCreationValidationRules(),
    validate,
    createPicuCase
);

router.put(
    '/v1/picu/cases/:picuCaseId',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseUpdateValidationRules(),
    validate,
    updatePicuCase
);

router.delete(
    '/v1/picu/cases/:picuCaseId',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseIdValidation,
    deletePicuCase
);

router.get(
    '/v1/picu/cases',
    requirePermissions([permissionsMap.picuStaff]),
    getPicuCases
);

router.get(
    '/v1/picu/cases/:picuCaseId',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseIdValidation,
    getPicuCase
);