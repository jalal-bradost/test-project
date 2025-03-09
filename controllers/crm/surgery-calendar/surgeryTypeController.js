const { SurgeryTypeCRM } = require("../../../models");

const getAllSurgeryTypes = async (req, res) => {
    try {
        const surgeryTypes = await SurgeryTypeCRM.findAll();
        res.json(surgeryTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSurgeryTypeById = async (req, res) => {
    try {
        const surgeryType = await SurgeryTypeCRM.findByPk(req.params.id);
        if (surgeryType) {
            res.json(surgeryType);
        } else {
            res.status(404).json({ message: "Surgery type not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createSurgeryType = async (req, res) => {
    try {
        const { name } = req.body;
        const newSurgeryType = await SurgeryTypeCRM.create({ name });
        res.status(201).json(newSurgeryType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSurgeryType = async (req, res) => {
    try {
        const result = await SurgeryTypeCRM.destroy({ where: { surgeryTypeId: req.params.id } });
        if (result) {
            res.json({ message: "Surgery type deleted successfully" });
        } else {
            res.status(404).json({ message: "Surgery type not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllSurgeryTypes,
    getSurgeryTypeById,
    createSurgeryType,
    deleteSurgeryType,
};
