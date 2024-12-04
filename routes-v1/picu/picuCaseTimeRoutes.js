const {validate} = require("../../validations/validation");
const {
    picuCaseTimeUpdateValidationRules,
    picuCaseTimeIdValidation, picuCaseTimeCreationValidationRules
} = require("../../validations/picu/picuCaseTimeValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createPicuCaseTime,
    updatePicuCaseTime,
    deletePicuCaseTime,
    getPicuCaseTimes,
    getPicuCaseTime
} = require("../../controllers/picu/picuCaseTimeController");

router.post(
    '/v1/picu/cases/:picuCaseId/times',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseTimeCreationValidationRules(),
    validate,
    createPicuCaseTime
);

router.put(
    '/v1/picu/cases/:picuCaseId/times/:picuCaseTimeId',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseTimeUpdateValidationRules(),
    validate,
    updatePicuCaseTime
);

router.delete(
    '/v1/picu/cases/:picuCaseId/times/:picuCaseTimeId',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseTimeIdValidation,
    deletePicuCaseTime
);

router.get(
    '/v1/picu/cases/:picuCaseId/times',
    requirePermissions([permissionsMap.picuStaff]),
    getPicuCaseTimes
);

router.get(
    '/v1/picu/cases/:picuCaseId/times/:picuCaseTimeId',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseTimeIdValidation,
    getPicuCaseTime
);