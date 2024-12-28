const { PatientCRMStatus } = require("../../../models");

const getAllStatuses = async (req, res) => {
    try {
        const statuses = await PatientCRMStatus.findAll();
        res.json(statuses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStatusById = async (req, res) => {
    try {
        const status = await PatientCRMStatus.findByPk(req.params.id);
        if (status) {
            res.json(status);
        } else {
            res.status(404).json({ message: "Status not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createStatus = async (req, res) => {
    try {
        const { name } = req.body;
        const newStatus = await PatientCRMStatus.create({ name });
        res.status(201).json(newStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteStatus = async (req, res) => {
    try {
        const result = await PatientCRMStatus.destroy({ where: { addressId: req.params.id } });
        if (result) {
            res.json({ message: "Status deleted successfully" });
        } else {
            res.status(404).json({ message: "Status not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllStatuses,
    getStatusById,
    createStatus,
    deleteStatus,
};
