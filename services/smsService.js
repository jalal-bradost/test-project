const axios = require('axios');
const {orderDepartmentNames, orderTypeNames, orderStatusNames} = require("../routes/orders/orderProperties");
const {Role, Employee, User, Department} = require("../models");
const {Op} = require("sequelize");
const permissionMap = require("../utils/permissionMap");
const token = "af570d2998e90e7d306d409b3709d8cc-d1759347-5d06-4cc0-8a83-3aebb160f1f2"
const notifyOrderCreation = async (creator, departmentId, orderTypeId) => {
    const department = orderDepartmentNames[departmentId]
    const orderType = orderTypeNames[orderTypeId]
    const roles = await Role.findAll({
        where: {
            permissions: {
                [Op.contains]: [permissionMap.humanResources]
            }
        },
        include: {
            model: User,
            include: {
                model: Employee,
                as: "employee"
            }
        }
    })
    for (const role of roles) {
        for (const toSend of role.Users) {
            if (!toSend.employee) continue;
            const {employee} = toSend;
            const placeholders = [employee.firstName, department, creator?.employee?.firstName || creator?.name || "NO_NAME", orderType]
            sendWhatsappMessage("964" + employee.phoneNumber, "order_creation", placeholders)
        }
    }
}

const notifyOrderStatusChange = async (order, status, reason) => {
    const orderType = orderTypeNames[order.type]
    const statusName = orderStatusNames[status]
    if (!order.user) return;
    const {employee} = order.user;
    const placeholders = [employee.firstName, order.orderId, orderType, statusName, reason]
    sendWhatsappMessage("964" + employee.phoneNumber, "order_status", placeholders)
}

const notifyOrderWaiting = async (creator, departmentId, orderTypeId, permission) => {
    const department = orderDepartmentNames[departmentId]
    const orderType = orderTypeNames[orderTypeId]
    const roles = await Role.findAll({
        where: {
            permissions: {
                [Op.contains]: [permission]
            }
        },
        include: {
            model: User,
            include: {
                model: Employee,
                as: "employee"
            }
        }
    })
    for (const role of roles) {
        for (const toSend of role.Users) {
            if (!toSend.employee) continue;
            const {employee} = toSend;
            const placeholders = [employee.firstName, department, creator?.employee?.firstName || creator?.name || "NO_NAME", orderType]
            sendWhatsappMessage("964" + employee.phoneNumber, "order_creation", placeholders)
        }
    }
}

const notifyFormSubmission = (name, phone, issue) => {
    const placeholders = [name, phone, issue]
    sendWhatsappMessage("9647515323827", "form_sumbission", placeholders)
    sendWhatsappMessage("9647733069090", "form_sumbission", placeholders)
    sendWhatsappMessage("9647502384860", "form_sumbission", placeholders)
}

const notifyKakGoran = (department, content) => {
    const placeholders = [department, content]
    sendWhatsappMessage("9647504325659", "accountant_alert", placeholders)
    // sendWhatsappMessage("9647512380132", "accountant_alert", placeholders)
}

const notifyAppointmentSubmission = (name, phone, date, referral) => {
    const placeholders = [name, phone, date, referral]
    sendWhatsappMessage("9647733069090", "appointment", placeholders)
    sendWhatsappMessage("9647517131746", "appointment", placeholders)
}

const notifyTaskCreation = async (employee, task) => {
    const placeholders = [employee.firstName, task.name, task.deadline.toLocaleDateString()];
    let phoneNum = "964" + employee.phoneNumber;
    if (phoneNum.length !== 13) {
        console.error("Invalid phone number", phoneNum, "for employee", employee.employeeId);
        return;
    }
    sendWhatsappMessage(phoneNum, "task_creation", placeholders)
}

const notifyTaskManagers = async (taskEmployee, task) => {
    const roles = await Role.findAll({
        where: {
            permissions: {
                [Op.contains]: [permissionMap.humanResources]
            }
        },
        include: {
            model: User,
            include: {
                model: Employee,
                as: "employee"
            }
        }
    })
    const taskEmployeeFullName = taskEmployee.firstName + " " + taskEmployee.middleName + " " + taskEmployee.lastName;
    const department = (await Department.findByPk(taskEmployee.departmentId))?.name || "NO_DEPARTMENT";
    for (const role of roles) {
        for (const toSend of role.Users) {
            if (!toSend.employee) continue;
            const {employee} = toSend;
            let phoneNum = "964" + employee.phoneNumber;
            if (phoneNum.length !== 13) {
                console.error("Invalid phone number", phoneNum, "for employee", employee.employeeId);
                continue;
            }
            const placeholders = [employee.firstName, taskEmployeeFullName, department, task.name]
            sendWhatsappMessage(phoneNum, "task_notify_managers", placeholders)
        }
    }
}

const notifyTaskManagersDue = async (taskEmployee, task, type) => {
    const roles = await Role.findAll({
        where: {
            permissions: {
                [Op.contains]: [permissionMap.humanResources]
            }
        },
        include: {
            model: User,
            include: {
                model: Employee,
                as: "employee"
            }
        }
    })
    const taskEmployeeFullName = taskEmployee.firstName + " " + taskEmployee.middleName + " " + taskEmployee.lastName;
    const department = (await Department.findByPk(taskEmployee.departmentId))?.name || "NO_DEPARTMENT";
    for (const role of roles) {
        for (const toSend of role.Users) {
            if (!toSend.employee) continue;
            const {employee} = toSend;
            let phoneNum = "964" + employee.phoneNumber;
            if (phoneNum.length !== 13) {
                console.error("Invalid phone number", phoneNum, "for employee", employee.employeeId);
                continue;
            }
            const placeholders = [employee.firstName, taskEmployeeFullName, department, task.name]
            sendWhatsappMessage(phoneNum, `task_${type}_notify_managers`, placeholders)
        }
    }
}

const sendWhatsappMessage = (phoneNumber, templateName, placeholders) => {
    axios.post('https://rgxw4y.api.infobip.com/whatsapp/1/message/template', {
        "messages": [{
            "from": "18124899646",
            "to": phoneNumber,
            "messageId": Date.now(),
            "content": {
                templateName, "templateData": {
                    "body": {
                        placeholders
                    }
                }, "language": "en_US"
            }
        }]
    }, {
        headers: {
            'Authorization': `App ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'
        }
    })
        .then(function (response) {
            // console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}
module.exports = {
    notifyOrderCreation,
    notifyOrderStatusChange,
    notifyOrderWaiting,
    notifyFormSubmission,
    notifyAppointmentSubmission,
    notifyTaskCreation,
    notifyTaskManagers,
    notifyKakGoran,
    notifyTaskManagersDue
}