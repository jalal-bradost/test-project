const { DepartmentLeader } = require("../../models");

const createDepartmentLeader = async (req, res) => {
    const { departmentId, employeeId } = req.body;
    try {
        const departmentLeader = await DepartmentLeader.create({ departmentId, employeeId });
        return res.status(201).json(departmentLeader);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const updateDepartmentLeader = async (req, res) => {
    const departmentLeaderId = req.params.departmentLeaderId;
    const { departmentId, employeeId } = req.body;
    try {
        const departmentLeader = await DepartmentLeader.findByPk(departmentLeaderId);
        if (!departmentLeader) {
            return res.status(404).json({ error: 'Department Leader not found' });
        }
        await departmentLeader.update({ departmentId, employeeId });
        return res.status(204).json({ message: 'Department Leader updated' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const deleteDepartmentLeader = async (req, res) => {
    const departmentLeaderId = req.params.departmentLeaderId;
    try {
        const departmentLeader = await DepartmentLeader.findByPk(departmentLeaderId);
        if (!departmentLeader) {
            return res.status(404).json({ error: 'Department Leader not found' });
        }
        await departmentLeader.destroy();
        return res.status(200).json({ message: 'Department Leader deleted' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const getDepartmentLeaders = async (req, res) => {
    try {
        const departmentLeaders = await DepartmentLeader.findAll();
        return res.status(200).json(departmentLeaders);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createDepartmentLeader,
    updateDepartmentLeader,
    deleteDepartmentLeader,
    getDepartmentLeaders
};