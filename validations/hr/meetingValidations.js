const {body, param} = require('express-validator');
const {Meeting, Employee} = require("../../models");

const meetingCreationValidationRules = () => {
    return [
        body('title').notEmpty().withMessage('Title is required'),
        body('description').optional(),
        body('type').isIn(['Online', 'In-Person']).withMessage('Type must be either Online or In-Person'),
        body('startTime').isISO8601().toDate().withMessage('Start time must be a valid date'),
        body('endTime').isISO8601().toDate().withMessage('End time must be a valid date')
            .custom((endTime, {req}) => {
                if (new Date(endTime) <= new Date(req.body.startTime)) {
                    throw new Error('End time must be after start time');
                }
                return true;
            }),
        body('hostId').isInt().withMessage('Host ID must be an integer')
            .custom(async (hostId) => {
                const host = await Employee.findByPk(hostId);
                if (!host) {
                    throw new Error('Host not found');
                }
                return true;
            }),
        body('participantIds').isArray().withMessage('Participant IDs must be an array')
            .custom(async (participantIds) => {
                const participants = await Employee.findAll({
                    where: {employeeId: participantIds}
                });
                if (participants.length !== participantIds.length) {
                    throw new Error('One or more participants not found');
                }
                return true;
            }),
    ];
};

const meetingUpdateValidationRules = () => {
    return [
        param('meetingId').isInt().withMessage('Meeting ID must be an integer'),
        body('title').optional().notEmpty().withMessage('Title cannot be empty'),
        body('description').optional(),
        body('type').optional().isIn(['Online', 'In-Person']).withMessage('Type must be either Online or In-Person'),
        body('startTime').optional().isISO8601().toDate().withMessage('Start time must be a valid date'),
        body('endTime').optional().isISO8601().toDate().withMessage('End time must be a valid date')
            .custom((endTime, {req}) => {
                if (endTime && req.body.startTime && new Date(endTime) <= new Date(req.body.startTime)) {
                    throw new Error('End time must be after start time');
                }
                return true;
            }),
        body('hostId').optional().isInt().withMessage('Host ID must be an integer')
            .custom(async (hostId) => {
                const host = await Employee.findByPk(hostId);
                if (!host) {
                    throw new Error('Host not found');
                }
                return true;
            }),
    ];
};

const meetingIdValidation = param('meetingId')
    .isInt().withMessage('Meeting ID must be an integer')
    .custom(async (meetingId) => {
        const meeting = await Meeting.findByPk(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }
        return true;
    });

const addIdeaValidationRules = () => {
    return [
        meetingIdValidation,
        body('employeeId').isInt().withMessage('Employee ID must be an integer')
            .custom(async (employeeId) => {
                const employee = await Employee.findByPk(employeeId);
                if (!employee) {
                    throw new Error('Employee not found');
                }
                return true;
            }),
        body('content').notEmpty().withMessage('Idea content is required'),
    ];
};

const updateAttendanceValidationRules = () => {
    return [
        meetingIdValidation,
        param('employeeId').isInt().withMessage('Employee ID must be an integer'),
        body('attended').isBoolean().withMessage('Attended must be a boolean'),
        body('joinTime').optional().isISO8601().toDate().withMessage('Join time must be a valid date'),
        body('leaveTime').optional().isISO8601().toDate().withMessage('Leave time must be a valid date')
            .custom((leaveTime, {req}) => {
                if (leaveTime && req.body.joinTime && new Date(leaveTime) <= new Date(req.body.joinTime)) {
                    throw new Error('Leave time must be after join time');
                }
                return true;
            }),
    ];
};

const endMeetingValidationRules = () => {
    return [
        meetingIdValidation,
        body('conclusion').notEmpty().withMessage('Conclusion is required'),
    ];
};

const updateMeetingTimeValidationRules = () => {
    return [
        meetingIdValidation,
        body('startTime').isISO8601().toDate().withMessage('Start time must be a valid date'),
        body('endTime').isISO8601().toDate().withMessage('End time must be a valid date')
            .custom((endTime, {req}) => {
                if (new Date(endTime) <= new Date(req.body.startTime)) {
                    throw new Error('End time must be after start time');
                }
                return true;
            }),
    ];
};

module.exports = {
    meetingCreationValidationRules,
    meetingUpdateValidationRules,
    meetingIdValidation,
    addIdeaValidationRules,
    updateAttendanceValidationRules,
    endMeetingValidationRules,
    updateMeetingTimeValidationRules
};
