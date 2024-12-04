const {validate} = require("../../validations/validation");
const {
    picuTimeCreationValidationRules,
    picuTimeIdValidation, picuTimeUpdateValidationRules
} = require("../../validations/picu/picuTimeValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createPicuTime,
    updatePicuTime,
    deletePicuTime,
    getPicuTimes,
    getPicuTime
} = require("../../controllers/picu/picuTimeController");

router.post(
    '/v1/picu/times',
    requirePermissions([permissionsMap.picuStaff]),
    picuTimeCreationValidationRules(),
    validate,
    createPicuTime
);

router.put(
    '/v1/picu/times/:picuTimeId',
    requirePermissions([permissionsMap.picuStaff]),
    picuTimeUpdateValidationRules(),
    validate,
    updatePicuTime
);

router.delete(
    '/v1/picu/times/:picuTimeId',
    requirePermissions([permissionsMap.picuStaff]),
    picuTimeIdValidation,
    deletePicuTime
);

router.get(
    '/v1/picu/times',
    requirePermissions([permissionsMap.picuStaff]),
    getPicuTimes
);

router.get(
    '/v1/picu/times/:picuTimeId',
    requirePermissions([permissionsMap.picuStaff]),
    picuTimeIdValidation,
    getPicuTime
);