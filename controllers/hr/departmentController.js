const {Department, DepartmentLeader, Employee, EmployeeTask, EmployeeDailyTask, User} = require("../../models");
const permissionMap = require("../../utils/permissionMap");

const createDepartment = async (req, res) => {
    const {name} = req.body;
    try {
        const department = await Department.create({name});
        return res.status(201).json(department);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updateDepartment = async (req, res) => {
    const departmentId = req.params.departmentId;
    const {name} = req.body;
    try {
        const department = await Department.findByPk(departmentId);
        if (!department) {
            return res.status(404).json({error: 'Department not found'});
        }
        await department.update({name});
        return res.status(204).json({message: 'Department updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deleteDepartment = async (req, res) => {
    const departmentId = req.params.departmentId;
    try {
        const department = await Department.findByPk(departmentId);
        if (!department) {
            return res.status(404).json({error: 'Department not found'});
        }
        await department.destroy();
        return res.status(200).json({message: 'Department deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll({
            include: [
                {
                    model: DepartmentLeader,
                    as: 'leaders',
                    include: [
                        {
                            model: Employee,
                            as: 'employee'
                        }
                    ]
                }
            ]
        });
        return res.status(200).json(departments);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getDepartment = async (req, res) => {
    const departmentId = Number(req.params.departmentId);
    const user = req.user;
    if (!user.Role.permissions.includes(permissionMap.humanResources) && !user.Role.permissions.includes(permissionMap.root) && !user.employee.leaders.find(leader => leader.departmentId === departmentId)) {
        return res.status(403).json({error: 'You do not have permission to view this department'});
    }
    try {
        const department = await Department.findByPk(departmentId, {
            include: [
                {
                    model: Employee,
                    as: 'employees',
                    include: [
                        {
                            model: EmployeeTask,
                            as: 'tasks'
                        },
                        {
                            model: EmployeeDailyTask,
                            as: 'dailyTasks'
                        },
                        {
                            model: User,
                            as: 'user'
                        }
                    ]
                }
            ]
        });
        if (!department) {
            return res.status(404).json({error: 'Department not found'});
        }
        return res.status(200).json(department);
    } catch
        (error) {
        return res.status(400).json({error: error.message});
    }

}

module.exports = {
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartments,
    getDepartment
};