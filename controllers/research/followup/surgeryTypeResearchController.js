const { SurgeryTypeResearch } = require("../../../models");

const getAllSurgeryTypes = async (req, res) => {
    try {
        const types = await SurgeryTypeResearch.findAll();
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSurgeryTypeById = async (req, res) => {
    try {
        const type = await SurgeryTypeResearch.findByPk(req.params.id);
        if (type) {
            res.json(type);
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
        const newType = await SurgeryTypeResearch.create({ name });
        res.status(201).json(newType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSurgeryType = async (req, res) => {
    try {
        const result = await SurgeryTypeResearch.destroy({ where: { id: req.params.id } });
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
