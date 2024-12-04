const {validate} = require("../../../validations/validation");
const {surgeryTypeValidationRules} = require("../../../validations/surgery/surgeryTypeValidations");
const requirePermissions = require("../../../middlware/requirePermissions");
const permissionsMap = require("../../../utils/permissionMap");
const router = require("../../../config/express");
const {
    createSurgeryType,
    updateSurgeryType,
    deleteSurgeryType,
    getSurgeryTypes
} = require("../../../controllers/accountant/surgery/surgeryTypeController");

router.post(
    '/v1/surgery-types',
    requirePermissions([permissionsMap.accountant]),
    surgeryTypeValidationRules(),
    validate,
    createSurgeryType
);

router.put(
    '/v1/surgery-types/:surgeryTypeId',
    requirePermissions([permissionsMap.accountant]),
    surgeryTypeValidationRules(),
    validate,
    updateSurgeryType
);

router.delete(
    '/v1/surgery-types/:surgeryTypeId',
    requirePermissions([permissionsMap.accountant]),
    validate,
    deleteSurgeryType
);

router.get(
    '/v1/surgery-types',
    requirePermissions([permissionsMap.accountant]),
    getSurgeryTypes
);