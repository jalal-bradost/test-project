const {validate} = require("../../validations/validation");
const {
    perfusionCaseCreationValidationRules,
    perfusionCaseUpdateValidationRules,
    perfusionCaseIdValidation
} = require("../../validations/perfusion/perfusionCaseValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createPerfusionCase,
    updatePerfusionCase,
    deletePerfusionCase,
    getPerfusionCases,
    getPerfusionCase
} = require("../../controllers/perfusion/perfusionCaseController");

router.post(
    '/v1/perfusion/cases',
    requirePermissions([permissionsMap.perfusionStaff]),
    perfusionCaseCreationValidationRules(),
    validate,
    createPerfusionCase
);

router.put(
    '/v1/perfusion/cases/:perfusionCaseId',
    requirePermissions([permissionsMap.perfusionStaff]),
    perfusionCaseUpdateValidationRules(),
    validate,
    updatePerfusionCase
);

router.delete(
    '/v1/perfusion/cases/:perfusionCaseId',
    requirePermissions([permissionsMap.perfusionStaff]),
    perfusionCaseIdValidation,
    deletePerfusionCase
);

router.get(
    '/v1/perfusion/cases',
    requirePermissions([permissionsMap.perfusionStaff]),
    getPerfusionCases
);

router.get(
    '/v1/perfusion/cases/:perfusionCaseId',
    requirePermissions([permissionsMap.perfusionStaff]),
    perfusionCaseIdValidation,
    getPerfusionCase
);