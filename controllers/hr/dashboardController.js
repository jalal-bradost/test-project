const {
    EmployeeTask,
    Employee,
    Department,
    EmployeeRole,
    sequelize
} = require("../../models");
const {Op} = require("sequelize");

const getDashboardData = async (req, res) => {
    try {
        let {startDate, endDate, departmentId, roleId, employeeId, priority, status} = req.query;

// If startDate and endDate are not provided or are the same, set a default range
        if (!startDate || !endDate || startDate === endDate) {
            endDate = new Date();
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        } else {
            // Parse the dates if they're provided as strings
            startDate = new Date(startDate);
            endDate = new Date(endDate);
        }

        // Base query
        let whereClause = {
            createdAt: {[Op.between]: [startDate, endDate]}
        };
        if (priority !== undefined) whereClause.priority = priority;
        if (status !== undefined) whereClause.status = status;

        // Employee filter
        let employeeWhereClause = {};
        if (departmentId) employeeWhereClause.departmentId = departmentId;
        if (roleId) employeeWhereClause.roleId = roleId;
        if (employeeId) employeeWhereClause.employeeId = employeeId;

        // Fetch tasks
        const tasks = await EmployeeTask.findAll({
            where: whereClause,
            include: [{
                model: Employee,
                as: 'employee',
                where: employeeWhereClause,
                include: [
                    {model: Department, as: 'department'},
                    {model: EmployeeRole, as: 'role'}
                ]
            }]
        });

        // Calculate dashboard data
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 2).length;
        const pendingReviewTasks = tasks.filter(task => task.status === 1).length;
        const ongoingTasks = tasks.filter(task => task.status === 0).length;
        const overdueTasks = tasks.filter(task => new Date(task.deadline) < new Date() && task.status !== 2).length;
        const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Task status distribution
        const taskStatusDistribution = {
            active: ongoingTasks,
            pending: pendingReviewTasks,
            completed: completedTasks
        };

        // Task priority distribution
        const taskPriorityDistribution = {
            low: tasks.filter(task => task.priority === 0).length,
            medium: tasks.filter(task => task.priority === 1).length,
            high: tasks.filter(task => task.priority === 2).length
        };

        // Department-wise breakdown
        const departmentBreakdown = await EmployeeTask.findAll({
            where: whereClause,
            include: [{
                model: Employee,
                as: 'employee',
                where: employeeWhereClause,
                include: [{
                    model: Department,
                    as: 'department',
                    attributes: ['departmentId', 'name']
                }],
                attributes: []
            }],
            group: ['employee.department.departmentId', 'employee.department.name'],
            attributes: [
                [sequelize.col('employee.department.name'), 'departmentName'],
                [sequelize.col('employee.department.departmentId'), 'departmentId'],
                [sequelize.fn('COUNT', sequelize.col('EmployeeTask.taskId')), 'taskCount'],
                [sequelize.fn('AVG', sequelize.col('EmployeeTask.employeeCompletionRate')), 'avgCompletionRate']
            ]
        });

        // Top performers
        const topPerformers = await Employee.findAll({
            attributes: [
                'employeeId',
                'firstName',
                'middleName',
                [sequelize.fn('AVG', sequelize.col('tasks.employeeCompletionRate')), 'avgCompletionRate'],
                [sequelize.fn('AVG', sequelize.col('tasks.managerCompletionRate')), 'avgManagerRate']
            ],
            include: [{
                model: EmployeeTask,
                as: 'tasks',
                attributes: [],
                where: whereClause,
                required: true
            }],
            where: employeeWhereClause,
            group: ['Employee.employeeId', 'Employee.firstName', 'Employee.middleName'],
            order: [[sequelize.fn('AVG', sequelize.col('tasks.employeeCompletionRate')), 'DESC']],
            limit: 5,
            subQuery: false
        });

        // Task completion trend
        const taskCompletionTrend = await EmployeeTask.findAll({
            where: {
                ...whereClause,
                status: 2, // Completed tasks
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('completionDate')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('taskId')), 'completedCount']
            ],
            group: [sequelize.fn('DATE', sequelize.col('completionDate'))],
            order: [[sequelize.fn('DATE', sequelize.col('completionDate')), 'ASC']]
        });
        const filledTaskCompletionTrend = fillDateGaps(taskCompletionTrend, startDate, endDate);

        // Average task duration
        const avgTaskDuration = await EmployeeTask.findAll({
            where: {
                ...whereClause,
                status: 2, // Completed tasks
                completionDate: {[Op.not]: null}
            },
            attributes: [
                [sequelize.literal('AVG(EXTRACT(EPOCH FROM ("EmployeeTask"."completionDate" - "EmployeeTask"."createdAt")))'), 'avgDuration']
            ]
        });

        // Average task duration over time
        const avgTaskDurationTrend = await EmployeeTask.findAll({
            where: {
                ...whereClause,
                status: 2, // Completed tasks
                completionDate: {
                    [Op.and]: [
                        {[Op.between]: [startDate, endDate]},
                        {[Op.not]: null}
                    ]
                },
                createdAt: {[Op.not]: null}
            },
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'week', sequelize.col('completionDate')), 'week'],
                [sequelize.literal('AVG(EXTRACT(EPOCH FROM ("EmployeeTask"."completionDate" - "EmployeeTask"."createdAt")))'), 'avgDuration']
            ],
            group: [sequelize.fn('DATE_TRUNC', 'week', sequelize.col('completionDate'))],
            order: [[sequelize.fn('DATE_TRUNC', 'week', sequelize.col('completionDate')), 'ASC']]
        });

        // Frozen tasks analysis
        const frozenTasksCount = tasks.filter(task => task.freezeDate !== null).length;

        const processedAvgTaskDurationTrend = avgTaskDurationTrend.map(item => ({
            week: item.get('week'),
            avgDuration: (parseFloat(item.get('avgDuration')) / 86400).toFixed(2) // Convert seconds to days
        }));

        res.status(200).json({
            totalTasks,
            completedTasks,
            ongoingTasks,
            overdueTasks,
            pendingReviewTasks,
            taskCompletionRate,
            taskStatusDistribution,
            taskPriorityDistribution,
            departmentBreakdown,
            topPerformers,
            taskCompletionTrend: filledTaskCompletionTrend,
            avgTaskDuration: (parseFloat(avgTaskDuration[0].get('avgDuration')) / 86400).toFixed(2), // Convert seconds to days
            avgTaskDurationTrend: processedAvgTaskDurationTrend,
            frozenTasksAnalysis: {
                frozenTasksCount,
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'An error occurred while fetching dashboard data'});
    }
};

// Helper function to fill date gaps
function fillDateGaps(data, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateMap = new Map(data.map(item => [item.get('date'), item.get('completedCount')]));

    const filledData = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0];
        filledData.push({
            date: dateString,
            completedCount: dateMap.get(dateString) || 0
        });
    }

    return filledData;
}

module.exports = {
    getDashboardData
};