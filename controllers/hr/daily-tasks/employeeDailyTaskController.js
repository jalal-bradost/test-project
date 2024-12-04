const {
    EmployeeDailyTask,
    Employee,
    User,
    EmployeeDailyTaskNotificationLimit,
    sequelize,
    EmployeeDailyTaskSheet
} = require("../../../models");
const permissionMap = require("../../../utils/permissionMap");

const createEmployeeDailyTask = async (req, res) => {
    const transaction = await sequelize.transaction();
    const {name, description, employeeId, taskPercentage} = req.body;
    const departmentId = req.employee.departmentId;
    const user = req.user;
    if (!user.Role.permissions.includes(permissionMap.humanResources) && !user.Role.permissions.includes(permissionMap.root) && !user.employee.leaders.find(leader => leader.departmentId === departmentId)) {
        return res.status(403).json({error: 'You do not have permission to view this department'});
    }
    try {
        const employeeDailyTask = await EmployeeDailyTask.create({
            name,
            description,
            employeeId,
            taskPercentage
        }, {transaction});
        await transaction.commit();
        return res.status(201).json(employeeDailyTask);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const createEmployeeDailyTaskNotification = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const employeeDailyTask = req.employeeDailyTask;
        const employee = req.user.employee;
        if (!employee || !employeeDailyTask) {
            return res.status(404).json({error: 'Employee or DailyTask not found'});
        }
        if (employeeDailyTask.employeeId !== employee.employeeId) {
            return res.status(401).json({error: 'Unauthorized'});
        }
        const notificationLimit = await EmployeeDailyTaskNotificationLimit.findByPk(employee.employeeId, {transaction});
        if (notificationLimit) {
            if (Date.now() - notificationLimit.createdAt < 1000 * 60 * 60 * 3) {
                return res.status(400).json({error: 'You can only send a notification every 3 hours'});
            } else {
                await notificationLimit.update({createdAt: Date.now()}, {transaction});
            }
        } else {
            await EmployeeDailyTaskNotificationLimit.create({employeeId: employee.employeeId}, {transaction});
        }
        await transaction.commit();
        return res.status(201).json({message: 'Notification sent'});
    } catch (error) {
        await transaction.rollback();
        return res.status(400).json({error: error.message});
    }
};

const updateEmployeeDailyTask = async (req, res) => {
    const taskId = req.params.taskId;
    const {name, description, taskPercentage} = req.body;
    try {
        const employeeDailyTask = await EmployeeDailyTask.findByPk(taskId);
        if (!employeeDailyTask) {
            return res.status(404).json({error: 'Employee dailyTask not found'});
        }
        const employee = await Employee.findByPk(employeeDailyTask.employeeId);
        const departmentId = employee.departmentId;
        const user = req.user;
        if (!user.Role.permissions.includes(permissionMap.humanResources) && !user.Role.permissions.includes(permissionMap.root) && !user.employee.leaders.find(leader => leader.departmentId === departmentId)) {
            return res.status(403).json({error: 'You do not have permission to view this department'});
        }
        await employeeDailyTask.update({name, description, taskPercentage});
        return res.status(204).json({message: 'Employee dailyTask updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};


const updateEmployeeDailyTaskManagerRate = async (req, res) => {
    const taskId = req.params.taskId;
    const {managerCompletionRate} = req.body;
    try {
        const employeeDailyTask = await EmployeeDailyTask.findByPk(taskId);
        if (!employeeDailyTask) {
            return res.status(404).json({error: 'Employee dailyTask not found'});
        }
        const employee = await Employee.findByPk(employeeDailyTask.employeeId);
        const departmentId = employee.departmentId;
        const user = req.user;
        if (!user.Role.permissions.includes(permissionMap.humanResources) && !user.Role.permissions.includes(permissionMap.root) && !user.employee.leaders.find(leader => leader.departmentId === departmentId)) {
            return res.status(403).json({error: 'You do not have permission to view this department'});
        }
        employeeDailyTask.managerCompletionRate = managerCompletionRate;
        await employeeDailyTask.save();
        return res.status(204).json({message: 'Employee dailyTask updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getEmployeeDailyTask = async (req, res) => {
    try {
        if (!req.employeeDailyTask) {
            return res.status(404).json({error: 'DailyTask not found'});
        }
        const employee = await Employee.findByPk(req.employeeDailyTask.employeeId);
        const departmentId = employee.departmentId;
        const user = req.user;
        if (user.employee.employeeId !== employee.employeeId && !user.Role.permissions.includes(permissionMap.humanResources) && !user.Role.permissions.includes(permissionMap.root) && !user.employee.leaders.find(leader => leader.departmentId === departmentId)) {
            return res.status(403).json({error: 'You do not have permission to view this department'});
        }
        const sheets = await EmployeeDailyTaskSheet.findAll({where: {taskId: req.employeeDailyTask.taskId}});
        return res.status(200).json({dailyTask: req.employeeDailyTask, sheets, employee});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }

}


const deleteEmployeeDailyTask = async (req, res) => {
    const taskId = req.params.taskId;
    try {
        const employeeDailyTask = await EmployeeDailyTask.findByPk(taskId);
        if (!employeeDailyTask) {
            return res.status(404).json({error: 'Employee dailyTask not found'});
        }
        const employee = await Employee.findByPk(employeeDailyTask.employeeId);
        const departmentId = employee.departmentId;
        const user = req.user;
        if (!user.Role.permissions.includes(permissionMap.humanResources) && !user.Role.permissions.includes(permissionMap.root) && !user.employee.leaders.find(leader => leader.departmentId === departmentId)) {
            return res.status(403).json({error: 'You do not have permission to view this department'});
        }
        await employeeDailyTask.destroy();
        return res.status(200).json({message: 'Employee dailyTask deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getEmployeeSelfDailyTasks = async (req, res) => {
    try {
        const user = req.user;
        if (!user?.employee) {
            return res.status(404).json({error: 'Employee not found'});
        }
        const employeeDailyTasks = await EmployeeDailyTask.findAll({where: {employeeId: user.employee.employeeId}});
        return res.status(200).json(employeeDailyTasks);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getEmployeeSelfDailyTask = async (req, res) => {
    try {
        const user = req.user;
        if (!user?.employee) {
            return res.status(404).json({error: 'Employee not found'});
        }
        if (!req.employeeDailyTask) {
            return res.status(404).json({error: 'DailyTask not found'});
        }
        if (req.employeeDailyTask.employeeId !== user.employee.employeeId) {
            return res.status(401).json({error: 'Unauthorized'});
        }
        const sheets = await EmployeeDailyTaskSheet.findAll({where: {taskId: req.employeeDailyTask.taskId}});
        return res.status(200).json({dailyTask: req.employeeDailyTask, sheets});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updateEmployeeSelfDailyTaskSheet = async (req, res) => {
    try {
        const user = req.user;
        if (!user?.employee) {
            return res.status(404).json({error: 'Employee not found'});
        }
        if (!req.employeeDailyTask) {
            return res.status(404).json({error: 'DailyTask not found'});
        }
        if (req.employeeDailyTask.employeeId !== user.employee.employeeId) {
            return res.status(401).json({error: 'Unauthorized'});
        }
        const currentDate = new Date();
        const {progress, description, obstacles} = req.body;
        await EmployeeDailyTaskSheet.create({
            taskId: req.employeeDailyTask.taskId,
            progress,
            description,
            obstacles,
            fillDate: currentDate
        });
        return res.status(200).json({message: 'DailyTask sheet updated successfully'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createEmployeeDailyTask,
    updateEmployeeDailyTask,
    deleteEmployeeDailyTask,
    getEmployeeSelfDailyTasks,
    updateEmployeeDailyTaskManagerRate,
    createEmployeeDailyTaskNotification,
    getEmployeeSelfDailyTask,
    updateEmployeeSelfDailyTaskSheet,
    getEmployeeDailyTask
};