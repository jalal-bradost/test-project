const {validate} = require("../../validations/validation");
const {
    employeeFeedbackCreateValidationRules, feedbackIdValidation
} = require("../../validations/hr/employeeFeedbackValidations");
const requirePermissions = require("../../middlware/requirePermissions");
const permissionsMap = require("../../utils/permissionMap");
const router = require("../../config/express");
const {
    createEmployeeFeedback,
    updateEmployeeFeedback,
    deleteEmployeeFeedback,
} = require("../../controllers/hr/employeeFeedbackController");

router.post(
    '/v1/employee/feedbacks',
    requirePermissions([permissionsMap.humanResources]),
    employeeFeedbackCreateValidationRules(),
    validate,
    createEmployeeFeedback
);

router.put(
    '/v1/employee/feedbacks/:feedbackId',
    requirePermissions([permissionsMap.humanResources]),
    employeeFeedbackCreateValidationRules(),
    feedbackIdValidation,
    validate,
    updateEmployeeFeedback
);

router.delete(
    '/v1/employee/feedbacks/:feedbackId',
    requirePermissions([permissionsMap.humanResources]),
    feedbackIdValidation,
    validate,
    deleteEmployeeFeedback
);