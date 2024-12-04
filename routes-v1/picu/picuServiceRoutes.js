const {validate} = require("../../validations/validation");
const {
    picuServiceCreationValidationRules,
    picuServiceIdValidation, picuServiceUpdateValidationRules
} = require("../../validations/picu/picuServiceValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createPicuService,
    updatePicuService,
    deletePicuService,
    getPicuServices,
    getPicuService
} = require("../../controllers/picu/picuServiceController");

router.post(
    '/v1/picu/services',
    requirePermissions([permissionsMap.picuStaff]),
    picuServiceCreationValidationRules(),
    validate,
    createPicuService
);

router.put(
    '/v1/picu/services/:picuServiceId',
    requirePermissions([permissionsMap.picuStaff]),
    picuServiceUpdateValidationRules(),
    validate,
    updatePicuService
);

router.delete(
    '/v1/picu/services/:picuServiceId',
    requirePermissions([permissionsMap.picuStaff]),
    picuServiceIdValidation,
    deletePicuService
);

router.get(
    '/v1/picu/services',
    requirePermissions([permissionsMap.picuStaff]),
    getPicuServices
);

router.get(
    '/v1/picu/services/:picuServiceId',
    requirePermissions([permissionsMap.picuStaff]),
    picuServiceIdValidation,
    getPicuService
);