const {EmployeeTask, EmployeeTaskNotificationLog, Employee} = require("../models");
const {notifyTaskManagersDue} = require("./smsService");

async function checkTasks() {
    await runChecks();
    setInterval(async () => {
        await runChecks();
    }, 60 * 60 * 1000)
}

async function runChecks() {
    try {
        const tasks = await EmployeeTask.findAll({
            include: {
                model: Employee,
                as: "employee",
            },
            where: {
                status: 0,
            }
        })
        // Identify if tasks are overdue or if they have 2 days left
        for (const task of tasks) {
            let type;
            if (task.deadline.getTime() < Date.now()) {
                type = "overdue";
            } else if (task.deadline.getTime() - Date.now() < (1000 * 60 * 60 * 24 * 2)) {
                type = "due";
            }
            if (!type) continue;
            const notificationLog = await EmployeeTaskNotificationLog.findOne({
                where: {
                    taskId: task.taskId,
                    type
                }
            })
            if (notificationLog) continue;
            await notifyTaskManagersDue(task.employee, task, type)
            await EmployeeTaskNotificationLog.create({
                taskId: task.taskId,
                type
            })
        }
    } catch (e) {
        console.log(e)
    }
}

module.exports = {
    checkTasks
}