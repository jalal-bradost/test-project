const {validate} = require("../../validations/validation");
const {
    picuCaseServiceUpdateValidationRules,
    picuCaseServiceIdValidation, picuCaseServiceCreationValidationRules
} = require("../../validations/picu/picuCaseServiceValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createPicuCaseService,
    updatePicuCaseService,
    deletePicuCaseService,
    getPicuCaseServices,
    getPicuCaseService,
} = require("../../controllers/picu/picuCaseServiceController");

router.post(
    '/v1/picu/cases/:picuCaseId/services',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseServiceCreationValidationRules(),
    validate,
    createPicuCaseService
);

router.put(
    '/v1/picu/cases/:picuCaseId/services/:picuCaseServiceId',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseServiceUpdateValidationRules(),
    validate,
    updatePicuCaseService
);

router.delete(
    '/v1/picu/cases/:picuCaseId/services/:picuCaseServiceId',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseServiceIdValidation,
    deletePicuCaseService
);

router.get(
    '/v1/picu/cases/:picuCaseId/services',
    requirePermissions([permissionsMap.picuStaff]),
    getPicuCaseServices
);

router.get(
    '/v1/picu/cases/:picuCaseId/services/:picuCaseServiceId',
    requirePermissions([permissionsMap.picuStaff]),
    picuCaseServiceIdValidation,
    getPicuCaseService
);