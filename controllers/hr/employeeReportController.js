const {EmployeeReport} = require("../../models");
const moment = require("moment-timezone");
const {Op} = require("sequelize");

const createEmployeeReport = async (req, res) => {
        const {accomplishments, plans} = req.body;
        try {
            const employee = req.user.employee;
            if (!employee) {
                return res.status(400).json({message: 'Employee not found'});
            }
            const mostRecentReport = await EmployeeReport.findOne({
                where: {
                    employeeId: employee.employeeId
                },
                order: [['createdAt', 'DESC']]  // Ensure that you get the latest report
            });

            if (mostRecentReport) {
                const now = moment().tz('Asia/Baghdad');
                const reportDate = moment(mostRecentReport.createdAt).tz('Asia/Baghdad');
                const daysSinceLastReport = now.diff(reportDate, 'days');

                // Check if the last report was made less than two days ago
                if (daysSinceLastReport <= 2) {
                    return res.status(400).json({message: 'Reports can only be created once a week'});
                }
            }
            const now = moment().tz('Asia/Baghdad');
            const allowedStart = moment().tz('Asia/Baghdad').day(4).hour(9);
            const allowedEnd = moment().tz('Asia/Baghdad').day(5).hour(23).minute(59);
            if (req.user.userId !== 1) {
                if (now.isBefore(allowedStart) || now.isAfter(allowedEnd)) {
                    return res.status(400).json({message: 'Employee can only create reports between Thursday 9 AM and Friday 11:59 PM'});
                }
            }
            const employeeReport = await EmployeeReport.create({
                employeeId: employee.employeeId,
                accomplishments,
                plans
            });
            return res.status(201).json(employeeReport);
        } catch
            (error) {
            return res.status(400).json({error: error.message});
        }
    }
;

const getEmployeeReports = async (req, res) => {
    try {
        const where = {};
        const employeeId = req.query.employeeId;
        if (employeeId) {
            where.employeeId = employeeId;
        }
        const reports = await EmployeeReport.findAll({
            where,
            order: [['createdAt', 'DESC']],
        });
        return res.status(200).json(reports);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }

}

module.exports = {
    createEmployeeReport,
    getEmployeeReports
};