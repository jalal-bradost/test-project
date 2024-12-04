const {
    createMeeting,
    updateMeeting,
    getMeeting,
    addIdea,
    updateAttendance,
    endMeeting, getAllMeetings, updateMeetingTime
} = require('../../controllers/hr/meetingController');
const permissionsMap = require('../../utils/permissionMap');
const isAuthenticated = require("../../middlware/isAuthenticatedMiddleware");
const requirePermissions = require("../../middlware/requirePermissions");
const router = require("../../config/express")

const {validate} = require('../../validations/validation');
const {
    meetingCreationValidationRules,
    meetingUpdateValidationRules,
    meetingIdValidation,
    addIdeaValidationRules,
    updateAttendanceValidationRules,
    endMeetingValidationRules, updateMeetingTimeValidationRules,
} = require('../../validations/hr/meetingValidations');

router.post(
    '/v1/meetings',
    isAuthenticated,
    requirePermissions([permissionsMap.humanResources]),
    meetingCreationValidationRules(),
    validate,
    createMeeting
);

router.put(
    '/v1/meetings/:meetingId',
    isAuthenticated,
    requirePermissions([permissionsMap.humanResources]),
    meetingUpdateValidationRules(),
    validate,
    updateMeeting
);

router.get(
    '/v1/meetings',
    isAuthenticated,
    getAllMeetings
);

router.get(
    '/v1/meetings/:meetingId',
    isAuthenticated,
    meetingIdValidation,
    validate,
    getMeeting
);

router.post(
    '/v1/meetings/:meetingId/ideas',
    isAuthenticated,
    addIdeaValidationRules(),
    validate,
    addIdea
);

router.put(
    '/v1/meetings/:meetingId/attendance/:employeeId',
    isAuthenticated,
    requirePermissions([permissionsMap.humanResources]),
    updateAttendanceValidationRules(),
    validate,
    updateAttendance
);

router.put(
    '/v1/meetings/:meetingId/end',
    isAuthenticated,
    requirePermissions([permissionsMap.humanResources]),
    endMeetingValidationRules(),
    validate,
    endMeeting
);

router.put(
    '/v1/meetings/:meetingId/update-time',
    isAuthenticated,
    requirePermissions([permissionsMap.humanResources]),
    updateMeetingTimeValidationRules(),
    validate,
    updateMeetingTime
);


module.exports = router;
