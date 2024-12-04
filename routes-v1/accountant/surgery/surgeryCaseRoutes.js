const {validate} = require("../../../validations/validation");
const {
    surgeryCaseCreationValidationRules,
    surgeryCaseUpdateValidationRules,
    surgeryCaseDeletionValidationRules,
} = require("../../../validations/surgery/surgeryCaseValidations");
const requirePermissions = require("../../../middlware/requirePermissions");
const permissionsMap = require("../../../utils/permissionMap");
const router = require("../../../config/express");
const {
    createSurgeryCase,
    updateSurgeryCase,
    deleteSurgeryCase,
    getSurgeryCases,
    getSurgeryCase,
} = require("../../../controllers/accountant/surgery/surgeryCaseController");
const isAuthenticated = require("../../../middlware/isAuthenticatedMiddleware");

router.post(
    "/v1/surgeries",
    requirePermissions([permissionsMap.accountant]),
    surgeryCaseCreationValidationRules(),
    validate,
    createSurgeryCase
);

router.put(
    "/v1/surgeries/:surgeryCaseId",
    requirePermissions([permissionsMap.accountant]),
    surgeryCaseUpdateValidationRules(),
    validate,
    updateSurgeryCase
);

router.delete(
    "/v1/surgeries/:surgeryCaseId",
    requirePermissions([permissionsMap.accountant]),
    surgeryCaseDeletionValidationRules(),
    validate,
    deleteSurgeryCase
);

router.get(
    "/v1/surgeries",
    isAuthenticated,
    // requirePermissions([permissionsMap.accountant]),
    getSurgeryCases
);

router.get(
    "/v1/surgeries/:surgeryCaseId",
    requirePermissions([permissionsMap.accountant]),
    getSurgeryCase
);