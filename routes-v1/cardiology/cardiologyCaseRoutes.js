const {validate} = require("../../validations/validation");
const {
    cardiologyCaseCreationValidationRules,
    cardiologyCaseUpdateValidationRules,
    cardiologyCaseIdValidation
} = require("../../validations/cardiology/cardiologyCaseValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createCardiologyCase,
    updateCardiologyCase,
    deleteCardiologyCase,
    getCardiologyCases,
    getCardiologyCase
} = require("../../controllers/cardiology/cardiologyCaseController");

router.post(
    '/v1/cardiology/cases',
    requirePermissions([permissionsMap.cardiologyStaff]),
    cardiologyCaseCreationValidationRules(),
    validate,
    createCardiologyCase
);

router.put(
    '/v1/cardiology/cases/:cardiologyCaseId',
    requirePermissions([permissionsMap.cardiologyStaff]),
    cardiologyCaseUpdateValidationRules(),
    validate,
    updateCardiologyCase
);

router.delete(
    '/v1/cardiology/cases/:cardiologyCaseId',
    requirePermissions([permissionsMap.cardiologyStaff]),
    cardiologyCaseIdValidation,
    deleteCardiologyCase
);

router.get(
    '/v1/cardiology/cases',
    requirePermissions([permissionsMap.cardiologyStaff]),
    getCardiologyCases
);

router.get(
    '/v1/cardiology/cases/:cardiologyCaseId',
    requirePermissions([permissionsMap.cardiologyStaff]),
    cardiologyCaseIdValidation,
    getCardiologyCase
);