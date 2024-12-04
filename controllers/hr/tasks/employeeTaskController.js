const {
    EmployeeTask,
    Employee,
    User,
    EmployeeTaskNotificationLimit,
    sequelize,
    EmployeeTaskSheet, EmployeeTaskChat, EmployeeTaskChatSeen
} = require("../../../models");
const {notifyTaskCreation, notifyTaskManagers} = require("../../../services/smsService");
const {Op} = require("sequelize");
const permissionMap = require("../../../utils/permissionMap");

const createEmployeeTask = async (req, res) => {
    const transaction = await sequelize.transaction();
    const departmentId = req.employee.departmentId;
    const user = req.user;
    if (!user.Role.permissions.includes(permissionMap.humanResources) && !user.Role.permissions.includes(permissionMap.root) && !user.employee.leaders.find(leader => leader.departmentId === departmentId)) {
        return res.status(403).json({error: 'You do not have permission to view this department'});
    }
    const {name, deadline, description, employeeId, priority, taskPercentage} = req.body;
    try {
        const employeeTask = await EmployeeTask.create({
            name,
            deadline,
            description,
            employeeId,
            priority,
            taskPercentage
        }, {transaction});
        if (req.employee) {
            await notifyTaskCreation(req.employee, employeeTask);
        } else {
            console.error("Employee not found");
        }
        const now = Date.now();
        const days = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        if (days < 0) {
            return res.status(400).json({error: 'Invalid deadline'});
        }
        for (let i = 0; i <= days; i++) {
            const fillDate = new Date((now + i * 1000 * 60 * 60 * 24) + (1000 * 60 * 60 * 3))
            if (fillDate.getDay() === 5) {
                continue;
            }
            await EmployeeTaskSheet.create({
                taskId: employeeTask.taskId,
                progress: 0,
                description: "",
                obstacles: "",
                fillDate: fillDate
            }, {transaction})
        }
        await transaction.commit();
        return res.status(201).json(employeeTask);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const createEmployeeTaskNotification = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const employeeTask = req.employeeTask;
        const employee = req.user.employee;
        if (!employee || !employeeTask) {
            return res.status(404).json({error: 'Employee or Task not found'});
        }
        if (employeeTask.employeeId !== employee.employeeId) {
            return res.status(401).json({error: 'Unauthorized'});
        }
        const notificationLimit = await EmployeeTaskNotificationLimit.findByPk(employee.employeeId, {transaction});
        if (notificationLimit) {
            if (Date.now() - notificationLimit.createdAt < 1000 * 60 * 60 * 3) {
                return res.status(400).json({error: 'You can only send a notification every 3 hours'});
            } else {
                await notificationLimit.update({createdAt: Date.now()}, {transaction});
            }
        } else {
            await EmployeeTaskNotificationLimit.create({employeeId: employee.employeeId}, {transaction});
        }
        await notifyTaskManagers(employee, employeeTask);
        await transaction.commit();
        return res.status(201).json({message: 'Notification sent'});
    } catch (error) {
        await transaction.rollback();
        return res.status(400).json({error: error.message});
    }
};

const updateEmployeeTask = async (req, res) => {
    const taskId = req.params.taskId;
    const {name, deadline, description, priority, taskPercentage} = req.body;
    try {
        const employeeTask = await EmployeeTask.findByPk(taskId);
        if (!employeeTask) {
            return res.status(404).json({error: 'Employee task not found'});
        }
        const employee = await Employee.findByPk(employeeTask.employeeId);
        const departmentId = employee.departmentId;
        const user = req.user;
        if (!user.Role.permissions.includes(permissionMap.humanResources) && !user.Role.permissions.includes(permissionMap.root) && !user.employee.leaders.find(leader => leader.departmentId === departmentId)) {
            return res.status(403).json({error: 'You do not have permission to view this department'});
        }
        const oldDeadline = employeeTask.deadline;
        await employeeTask.update({name, deadline, description, priority, taskPercentage});

        const now = Date.now();
        const oldDays = Math.ceil((oldDeadline - now) / (1000 * 60 * 60 * 24));
        const newDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        if (newDays < oldDays) {
            // Delete extra task sheets if deadline is reduced
            await EmployeeTaskSheet.destroy({
                where: {
                    taskId: employeeTask.taskId,
                    fillDate: {
                        [Op.gte]: new Date((now + newDays * 1000 * 60 * 60 * 24) + (1000 * 60 * 60 * 3))
                    }
                }
            });
        } else if (newDays > oldDays) {
            // Add new task sheets if deadline is extended
            const lastTaskSheet = await EmployeeTaskSheet.findOne({
                where: {taskId: employeeTask.taskId},
                order: [['fillDate', 'DESC']]
            });
            const lastFillDate = lastTaskSheet ? new Date(lastTaskSheet.fillDate) : new Date();
            console.log(lastFillDate);
            for (let i = oldDays; i <= newDays; i++) {
                const fillDate = new Date((lastFillDate.getTime() + (i - oldDays + 1) * 1000 * 60 * 60 * 24) + (1000 * 60 * 60 * 3));
                console.log(i, fillDate);
                if (fillDate.getDay() !== 5) { // Skip creating task sheet for Fridays
                    await EmployeeTaskSheet.create({
                        taskId: employeeTask.taskId,
                        progress: 0,
                        description: "",
                        obstacles: "",
                        fillDate: fillDate
                    });
                }
            }
        }

        return res.status(204).json({message: 'Employee task updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updateEmployeeTaskManagerRate = async (req, res) => {
    const taskId = req.params.taskId;
    const {managerCompletionRate} = req.body;
    try {
        const employeeTask = await EmployeeTask.findByPk(taskId, {
            include: {
                model: Employee,
                as: "employee"
            }
        });
        if (!employeeTask) {
            return res.status(404).json({error: 'Employee task not found'});
        }

        const user = req.user;
        const departmentId = employeeTask.employee.departmentId;

        if (!user.Role.permissions.includes(permissionMap.humanResources) &&
            !user.Role.permissions.includes(permissionMap.root) &&
            !user.employee.leaders.find(leader => leader.departmentId === departmentId)) {
            return res.status(403).json({error: 'You do not have permission to update this task'});
        }

        employeeTask.managerCompletionRate = managerCompletionRate;
        await employeeTask.save();
        return res.status(204).json({message: 'Employee task updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updateEmployeeTaskStatus = async (req, res) => {
    const taskId = req.params.taskId;
    const {status, completionDate} = req.body;
    try {
        const employeeTask = await EmployeeTask.findByPk(taskId, {
            include: {
                model: Employee,
                as: "employee",
                include: [{model: User, as: "user"}]
            }
        });
        if (!employeeTask) {
            return res.status(404).json({error: 'Employee task not found'});
        }

        const user = req.user;
        const departmentId = employeeTask.employee.departmentId;

        if (employeeTask.employee?.user?.userId !== user.userId &&
            user.Role.roleId !== 17 &&
            !user.Role.permissions.includes(0) &&
            !user.employee.leaders.find(leader => leader.departmentId === departmentId)) {
            return res.status(401).json({error: 'Unauthorized'});
        }

        if (status === 2) {
            await employeeTask.update({status, completionDate});
        } else {
            await employeeTask.update({status});
        }
        return res.status(204).json({message: 'Employee task updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updateEmployeeTaskSelfRate = async (req, res) => {
    const taskId = req.params.taskId;
    const {employeeCompletionRate} = req.body;
    try {
        const employeeTask = await EmployeeTask.findByPk(taskId, {
            include: {
                model: Employee,
                as: "employee",
                include: [{model: User, as: "user"}]
            }
        });
        if (!employeeTask) {
            return res.status(404).json({error: 'Employee task not found'});
        }
        if (employeeTask.employee?.user?.userId !== req.user.userId) {
            return res.status(401).json({error: 'Unauthorized'});
        }
        employeeTask.employeeCompletionRate = employeeCompletionRate;
        await employeeTask.save();
        return res.status(204).json({message: 'Employee task updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updateEmployeeTaskFreeze = async (req, res) => {
    const taskId = req.params.taskId;
    const {freeze} = req.body;
    const freezeDate = freeze ? new Date() : null;
    try {
        const employeeTask = await EmployeeTask.findByPk(taskId, {
            include: {
                model: Employee,
                as: "employee"
            }
        });
        if (!employeeTask) {
            return res.status(404).json({error: 'Employee task not found'});
        }

        const user = req.user;
        const departmentId = employeeTask.employee.departmentId;

        if (!user.Role.permissions.includes(permissionMap.humanResources) &&
            !user.Role.permissions.includes(permissionMap.root) &&
            !user.employee.leaders.find(leader => leader.departmentId === departmentId)) {
            return res.status(403).json({error: 'You do not have permission to freeze/unfreeze this task'});
        }

        const now = new Date();
        now.setHours(now.getHours() + 3); // Adjust to GMT+3

        if (freeze) {
            // Freezing the task
            employeeTask.freezeDate = freezeDate;

            // Delete future task sheets, but keep the current day's sheet
            await EmployeeTaskSheet.destroy({
                where: {
                    taskId: employeeTask.taskId,
                    fillDate: {
                        [Op.gt]: now
                    }
                }
            });

            await employeeTask.save();
            return res.status(204).json({message: 'Task frozen successfully'});
        } else {
            // Unfreezing the task
            if (!employeeTask.freezeDate) {
                return res.status(400).json({error: 'Task is not frozen'});
            }

            const frozenDuration = now - employeeTask.freezeDate;
            const newDeadline = new Date(employeeTask.deadline.getTime() + frozenDuration);

            // Update the deadline
            employeeTask.deadline = newDeadline;
            employeeTask.freezeDate = null;

            // Delete task sheets in the frozen period, but keep the current day's sheet
            await EmployeeTaskSheet.destroy({
                where: {
                    taskId: employeeTask.taskId,
                    fillDate: {
                        [Op.between]: [employeeTask.freezeDate, now],
                        [Op.ne]: now.setHours(0, 0, 0, 0) // Preserve current day's sheet
                    }
                }
            });

            // Create new task sheets for the extended period
            const days = Math.ceil((newDeadline - now) / (1000 * 60 * 60 * 24));
            for (let i = 1; i <= days; i++) { // Start from 1 to skip current day
                const fillDate = new Date(now.getTime() + i * 1000 * 60 * 60 * 24);
                if (fillDate.getDay() !== 5) { // Skip Fridays
                    await EmployeeTaskSheet.create({
                        taskId: employeeTask.taskId,
                        progress: 0,
                        description: "",
                        obstacles: "",
                        fillDate: fillDate
                    });
                }
            }

            await employeeTask.save();
            return res.status(204).json({message: 'Task unfrozen and updated successfully'});
        }
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getEmployeeTask = async (req, res) => {
    try {
        if (!req.employeeTask) {
            return res.status(404).json({error: 'Task not found'});
        }
        const employee = await Employee.findByPk(req.employeeTask.employeeId, {include: [{model: User, as: 'user'}]});
        if (!employee) {
            return res.status(404).json({error: 'Employee not found'});
        }
        const user = req.user;
        const departmentId = employee.departmentId;
        if (employee?.user?.userId !== user.userId &&
            user.Role.roleId !== 17 &&
            !user.Role.permissions.includes(0) &&
            !user.employee.leaders.find(leader => leader.departmentId === departmentId)) {
            return res.status(401).json({error: 'Unauthorized'});
        }
        const sheets = await EmployeeTaskSheet.findAll({where: {taskId: req.employeeTask.taskId}});
        return res.status(200).json({task: req.employeeTask, sheets, employee});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }

}


const deleteEmployeeTask = async (req, res) => {
    const taskId = req.params.taskId;
    try {
        const employeeTask = await EmployeeTask.findByPk(taskId);
        if (!employeeTask) {
            return res.status(404).json({error: 'Employee task not found'});
        }
        await employeeTask.destroy();
        return res.status(200).json({message: 'Employee task deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getEmployeeSelfTasks = async (req, res) => {
    try {
        const user = req.user;
        if (!user?.employee) {
            return res.status(404).json({error: 'Employee not found'});
        }

        const employeeTasks = await EmployeeTask.findAll({
            where: {employeeId: user.employee.employeeId},
            include: [
                {
                    model: EmployeeTaskChat,
                    as: 'chats',
                    include: [
                        {
                            model: EmployeeTaskChatSeen,
                            as: 'seenBy'
                        }
                    ]
                }
            ]
        });

        const tasksWithNewMessages = employeeTasks.map(task => {
            const hasNewMessages = task.chats.some(chat =>
                chat.userId !== user.userId &&
                !chat.seenBy.some(seen => seen.userId === user.userId)
            );

            const taskJSON = task.toJSON();
            delete taskJSON.chats; // Remove the chats data from the response

            return {
                ...taskJSON,
                hasNewMessages
            };
        });

        return res.status(200).json(tasksWithNewMessages);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getEmployeeSelfTask = async (req, res) => {
    try {
        const user = req.user;
        if (!user?.employee) {
            return res.status(404).json({error: 'Employee not found'});
        }
        if (!req.employeeTask) {
            return res.status(404).json({error: 'Task not found'});
        }
        if (req.employeeTask.employeeId !== user.employee.employeeId) {
            return res.status(401).json({error: 'Unauthorized'});
        }
        const sheets = await EmployeeTaskSheet.findAll({where: {taskId: req.employeeTask.taskId}});
        return res.status(200).json({task: req.employeeTask, sheets});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updateEmployeeSelfTaskSheet = async (req, res) => {
    try {
        const user = req.user;
        if (!user?.employee) {
            return res.status(404).json({error: 'Employee not found'});
        }
        if (!req.employeeTask) {
            return res.status(404).json({error: 'Task not found'});
        }
        if (!req.employeeTaskSheet) {
            return res.status(404).json({error: 'Task sheet not found'});
        }
        if (req.employeeTask.employeeId !== user.employee.employeeId) {
            return res.status(401).json({error: 'Unauthorized'});
        }
        const currentDate = new Date();
        //currentDate to gmt+3
        currentDate.setHours(currentDate.getHours() + 3);
        const fillDate = new Date(req.employeeTaskSheet.fillDate);
        console.log(currentDate, fillDate)
        if (!(fillDate.getDate() === currentDate.getDate() && fillDate.getMonth() === currentDate.getMonth() && fillDate.getFullYear() === currentDate.getFullYear())) {
            return res.status(400).json({error: 'Task sheet can only be updated for the current date'});
        }
        const {progress, description, obstacles} = req.body;
        await req.employeeTaskSheet.update({progress, description, obstacles});
        return res.status(200).json({message: 'Task sheet updated successfully'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};


module.exports = {
    createEmployeeTask,
    updateEmployeeTask,
    deleteEmployeeTask,
    getEmployeeSelfTasks,
    updateEmployeeTaskStatus,
    updateEmployeeTaskManagerRate,
    updateEmployeeTaskSelfRate,
    createEmployeeTaskNotification,
    getEmployeeSelfTask,
    updateEmployeeSelfTaskSheet,
    getEmployeeTask,
    updateEmployeeTaskFreeze
};
