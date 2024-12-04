const {uploadEmployeeImage} = require("../../services/storageService");
const {
    Employee,
    EmployeeRole,
    User,
    Department,
    EmployeeWallet,
    EmployeeTask,
    EmployeeFeedback, EmployeeDailyTask
} = require("../../models");
const permissionMap = require("../../utils/permissionMap");
const include = [
    {
        model: EmployeeRole,
        as: "role",
    },
    {
        model: User,
        as: "user",
    },
    {
        model: Department,
        as: "department",
    },
    {
        model: EmployeeWallet,
        as: "wallet",
    },
]

const createEmployee = async (req, res) => {
    const employeeData = req.body;
    try {
        let nationalCardImagePath = null;
        let infoCardImagePath = null;
        let agreementCopyImagePath = null;
        const randomUUID = Date.now() + "-" + Math.floor(Math.random() * 1000);
        if (employeeData.nationalCardImage) {
            nationalCardImagePath = await uploadEmployeeImage(
                `nationalCardImage-${randomUUID}`,
                employeeData.nationalCardImage
            );
        }

        if (employeeData.infoCardImage) {
            infoCardImagePath = await uploadEmployeeImage(
                `infoCardImage-${randomUUID}`,
                employeeData.infoCardImage
            );
        }

        if (employeeData.agreementCopyImage) {
            agreementCopyImagePath = await uploadEmployeeImage(
                `agreementCopyImage-${randomUUID}`,
                employeeData.agreementCopyImage
            );
        }

        const employee = await Employee.create({
            ...employeeData,
            nationalCardImage: nationalCardImagePath,
            infoCardImage: infoCardImagePath,
            agreementCopyImage: agreementCopyImagePath,
            dateOfBirth: employeeData.dateOfBirth || new Date()
        });
        return res.status(201).json(employee);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updateEmployee = async (req, res) => {
    const employeeId = req.params.employeeId;
    const employeeData = req.body;
    try {
        const employee = await Employee.findByPk(employeeId);
        const randomUUID = Date.now() + "-" + Math.floor(Math.random() * 1000);
        if (!employee) {
            return res.status(404).json({error: 'Employee not found'});
        }
        delete employeeData.employeeId;
        if (employeeData.nationalCardImage && employeeData.nationalCardImage.startsWith('data:image')) {
            employeeData.nationalCardImage = await uploadEmployeeImage(
                `nationalCardImage-${randomUUID}`,
                employeeData.nationalCardImage
            );
        }

        if (employeeData.infoCardImage && employeeData.infoCardImage.startsWith('data:image')) {
            employeeData.infoCardImage = await uploadEmployeeImage(
                `infoCardImage-${randomUUID}`,
                employeeData.infoCardImage
            );
        }

        if (employeeData.agreementCopyImage && employeeData.agreementCopyImage.startsWith('data:image')) {
            employeeData.agreementCopyImage = await uploadEmployeeImage(
                `agreementCopyImage-${randomUUID}`,
                employeeData.agreementCopyImage
            );
        }

        await employee.update({...employeeData, dateOfBirth: employeeData.dateOfBirth || new Date()});
        return res.status(204).json({message: 'Employee updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deleteEmployee = async (req, res) => {
    const employeeId = req.params.employeeId;
    try {
        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            return res.status(404).json({error: 'Employee not found'});
        }

        await employee.destroy();
        return res.status(200).json({message: 'Employee deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getEmployees = async (req, res) => {
    try {
        const filteredInclude = include;
        if (req.query.include) {
            const includeFields = req.query.include.split(',');
            if (includeFields.some(f => f === 'tasks')) {
                include.push({
                    model: EmployeeTask,
                    as: "tasks",
                    order: [['taskId', 'DESC']]
                })
            }
            if (includeFields.some(f => f === 'feedbacks')) {
                include.push({
                    model: EmployeeFeedback,
                    as: "feedbacks",
                })
            }
            if (includeFields.some(f => f === 'dailyTasks')) {
                include.push({
                    model: EmployeeDailyTask,
                    as: "dailyTasks",
                    order: [['taskId', 'DESC']]
                })
            }
        }
        const exclude = [];
        if (!req.user.Role.permissions.includes(permissionMap.viewSalary)) {
            exclude.push("salary");
            exclude.push("bonus");
        }
        const employees = await Employee.findAll({
            include: filteredInclude, attributes: {exclude}
        });
        return res.status(200).json(employees);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

const getEmployee = async (req, res) => {
    const employeeId = req.params.employeeId;
    const departmentId = req.employee.departmentId;
    const user = req.user;
    if (!user.Role.permissions.includes(permissionMap.humanResources) && !user.Role.permissions.includes(permissionMap.root) && !user.employee.leaders.find(leader => leader.departmentId === departmentId)) {
        return res.status(403).json({error: 'You do not have permission to view this department'});
    }
    try {
        const filteredInclude = include;
        if (req.query.include) {
            const includeFields = req.query.include.split(',');
            if (includeFields.some(f => f === 'tasks')) {
                include.push({
                    model: EmployeeTask,
                    as: "tasks",
                    order: [['taskId', 'DESC']]
                })
            }
            if (includeFields.some(f => f === 'dailyTasks')) {
                include.push({
                    model: EmployeeDailyTask,
                    as: "dailyTasks",
                    order: [['taskId', 'DESC']]
                })
            }
        }
        const exclude = [];
        if (!req.user.Role.permissions.includes(permissionMap.viewSalary)) {
            exclude.push("salary");
            exclude.push("bonus");
        }
        const employee = await Employee.findByPk(employeeId, {include: filteredInclude, attributes: {exclude}});
        return res.status(200).json(employee);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployees,
    getEmployee
}