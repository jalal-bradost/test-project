const { EmployeeRole } = require("../../models");

const createEmployeeRole = async (req, res) => {
    const { name } = req.body;
    try {
        const employeeRole = await EmployeeRole.create({ name });
        return res.status(201).json(employeeRole);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const updateEmployeeRole = async (req, res) => {
    const roleId = req.params.roleId;
    const { name } = req.body;
    try {
        const employeeRole = await EmployeeRole.findByPk(roleId);
        if (!employeeRole) {
            return res.status(404).json({ error: 'Employee role not found' });
        }
        await employeeRole.update({ name });
        return res.status(204).json({ message: 'Employee role updated' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const deleteEmployeeRole = async (req, res) => {
    const roleId = req.params.roleId;
    try {
        const employeeRole = await EmployeeRole.findByPk(roleId);
        if (!employeeRole) {
            return res.status(404).json({ error: 'Employee role not found' });
        }
        await employeeRole.destroy();
        return res.status(200).json({ message: 'Employee role deleted' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const getEmployeeRoles = async (req, res) => {
    try {
        const employeeRoles = await EmployeeRole.findAll();
        return res.status(200).json(employeeRoles);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createEmployeeRole,
    updateEmployeeRole,
    deleteEmployeeRole,
    getEmployeeRoles
};