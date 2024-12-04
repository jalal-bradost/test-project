const {validate} = require("../../validations/validation");
const {
    anesthesiaCaseCreationValidationRules,
    anesthesiaCaseUpdateValidationRules,
    anesthesiaCaseIdValidation
} = require("../../validations/anesthesia/anesthesiaCaseValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createAnesthesiaCase,
    updateAnesthesiaCase,
    deleteAnesthesiaCase,
    getAnesthesiaCases,
    getAnesthesiaCase
} = require("../../controllers/anesthesia/anesthesiaCaseController");

router.post(
    '/v1/anesthesia/cases',
    requirePermissions([permissionsMap.anesthesiaStaff]),
    anesthesiaCaseCreationValidationRules(),
    validate,
    createAnesthesiaCase
);

router.put(
    '/v1/anesthesia/cases/:anesthesiaCaseId',
    requirePermissions([permissionsMap.anesthesiaStaff]),
    anesthesiaCaseUpdateValidationRules(),
    validate,
    updateAnesthesiaCase
);

router.delete(
    '/v1/anesthesia/cases/:anesthesiaCaseId',
    requirePermissions([permissionsMap.anesthesiaStaff]),
    anesthesiaCaseIdValidation,
    deleteAnesthesiaCase
);

router.get(
    '/v1/anesthesia/cases',
    requirePermissions([permissionsMap.anesthesiaStaff]),
    getAnesthesiaCases
);

router.get(
    '/v1/anesthesia/cases/:anesthesiaCaseId',
    requirePermissions([permissionsMap.anesthesiaStaff]),
    anesthesiaCaseIdValidation,
    getAnesthesiaCase
);