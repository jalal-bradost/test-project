const {Meeting, MeetingParticipant, MeetingIdea, Employee, User} = require("../../models");
const {Op} = require("sequelize");
const {sendMeetingNotification} = require("../../services/notificationService");
const permissionMap = require("../../utils/permissionMap");

const createMeeting = async (req, res) => {
    try {
        const {title, description, type, startTime, endTime, hostId, participantIds} = req.body;

        const meeting = await Meeting.create({
            title,
            description,
            type,
            startTime,
            endTime,
            hostId,
        });

        await MeetingParticipant.bulkCreate(
            participantIds.map(id => ({meetingId: meeting.meetingId, employeeId: id}))
        );

        // Notify participants
        const participants = await Employee.findAll({
            where: {employeeId: {[Op.in]: participantIds}},
        });

        for (const participant of participants) {
            await sendMeetingNotification(participant, meeting, 'created');
        }

        res.status(201).json(meeting);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

const updateMeeting = async (req, res) => {
    try {
        const {meetingId} = req.params;
        const updateData = req.body;

        const meeting = await Meeting.findByPk(meetingId);
        if (!meeting) {
            return res.status(404).json({error: 'Meeting not found'});
        }

        await meeting.update(updateData);

        res.status(200).json(meeting);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

const getAllMeetings = async (req, res) => {
    try {
        const user = req.user;
        let meetings;

        if (user.Role.permissions.includes(permissionMap.humanResources) ||
            user.Role.permissions.includes(permissionMap.root)) {
            // Fetch all meetings for HR or users with root permissions
            meetings = await Meeting.findAll({
                include: [
                    {
                        model: Employee,
                        as: 'host',
                        attributes: ['employeeId', 'firstName', 'middleName', 'lastName']
                    },
                    {
                        model: MeetingParticipant,
                        as: 'participants',
                        include: [{
                            model: Employee,
                            as: 'employee',
                            attributes: ['employeeId', 'firstName', 'middleName', 'lastName']
                        }]
                    }
                ]
            });
        } else {
            // Fetch meetings where the user is a participant or a department leader
            const employee = await Employee.findOne({where: {userId: user.userId}});
            if (!employee) {
                return res.status(404).json({error: 'Employee not found'});
            }

            const leaderDepartmentIds = user.employee.leaders.map(leader => leader.departmentId);

            meetings = await Meeting.findAll({
                include: [
                    {
                        model: Employee,
                        as: 'host',
                        attributes: ['employeeId', 'firstName', 'middleName', 'lastName']
                    },
                    {
                        model: MeetingParticipant,
                        as: 'participants',
                        include: [{
                            model: Employee,
                            as: 'employee',
                            attributes: ['employeeId', 'firstName', 'middleName', 'lastName']
                        }]
                    }
                ],
                where: {
                    [Op.or]: [
                        {'$participants.employeeId$': employee.employeeId},
                        {'$host.departmentId$': {[Op.in]: leaderDepartmentIds}}
                    ]
                }
            });
        }

        res.status(200).json(meetings);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

const getMeeting = async (req, res) => {
    try {
        const {meetingId} = req.params;
        const meeting = await Meeting.findByPk(meetingId, {
            include: [
                {
                    model: MeetingParticipant, include: [{
                        model: Employee,
                        as: 'employee'
                    }], as: 'participants'
                },
                {
                    model: MeetingIdea, include: [{
                        model: Employee,
                        as: 'employee'
                    }], as: 'ideas'
                },
                {model: Employee, as: 'host'},
            ],
        });

        if (!meeting) {
            return res.status(404).json({error: 'Meeting not found'});
        }

        res.status(200).json(meeting);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

const addIdea = async (req, res) => {
    try {
        const {meetingId} = req.params;
        const {employeeId, content} = req.body;

        const idea = await MeetingIdea.create({
            meetingId,
            employeeId,
            content,
        });

        res.status(201).json(idea);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

const updateAttendance = async (req, res) => {
    try {
        const {meetingId, employeeId} = req.params;
        const {attended, joinTime, leaveTime} = req.body;

        const participant = await MeetingParticipant.findOne({
            where: {meetingId, employeeId},
        });

        if (!participant) {
            return res.status(404).json({error: 'Participant not found'});
        }

        await participant.update({attended, joinTime, leaveTime});

        res.status(200).json(participant);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

const endMeeting = async (req, res) => {
    try {
        const {meetingId} = req.params;
        const {conclusion} = req.body;

        const meeting = await Meeting.findByPk(meetingId);
        if (!meeting) {
            return res.status(404).json({error: 'Meeting not found'});
        }

        await meeting.update({status: 'Ended', conclusion});

        res.status(200).json(meeting);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

const updateMeetingTime = async (req, res) => {
    try {
        const {meetingId} = req.params;
        const {startTime, endTime} = req.body;

        const meeting = await Meeting.findByPk(meetingId, {
            include: [{
                model: MeetingParticipant, as: 'participants', include: [{
                    model: Employee,
                    as: 'employee'
                }]
            }]
        });
        if (!meeting) {
            return res.status(404).json({error: 'Meeting not found'});
        }

        // Convert times to UTC
        const utcStartTime = new Date(startTime).toUTCString();
        const utcEndTime = new Date(endTime).toUTCString();

        await meeting.update({
            startTime: utcStartTime,
            endTime: utcEndTime
        });

        for (const participant of meeting.participants) {
            await sendMeetingNotification(participant.employee, meeting, 'time_updated');
        }

        res.status(200).json(meeting);
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
};

module.exports = {
    createMeeting,
    updateMeeting,
    getMeeting,
    addIdea,
    updateAttendance,
    endMeeting,
    getAllMeetings,
    updateMeetingTime
};
