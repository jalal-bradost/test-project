const {SurgeryStatusCRM } = require("../../../models");

const getAllSurgeryStatuses = async (req, res) => {
    try {
        const statuses = await SurgeryStatusCRM.findAll();
        res.json(statuses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSurgeryStatusById = async (req, res) => {
    try {
        const status = await SurgeryStatusCRM.findByPk(req.params.id);
        if (status) {
            res.json(status);
        } else {
            res.status(404).json({ message: "Surgery status not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createSurgeryStatus = async (req, res) => {
    try {
        const { name,color } = req.body;
        const newStatus = await SurgeryStatusCRM.create({ name,color });
        res.status(201).json(newStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSurgeryStatus = async (req, res) => {
    try {
        const result = await SurgeryStatusCRM.destroy({ where: { surgeryStatusId: req.params.id } });
        if (result) {
            res.json({ message: "Surgery status deleted successfully" });
        } else {
            res.status(404).json({ message: "Surgery status not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllSurgeryStatuses,
    getSurgeryStatusById,
    createSurgeryStatus,
    deleteSurgeryStatus,
};
