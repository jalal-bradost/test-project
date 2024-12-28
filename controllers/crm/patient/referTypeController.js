const { PatientCRMReferType } = require("../../../models");

const getAllReferTypes = async (req, res) => {
    try {
        const referTypes = await PatientCRMReferType.findAll();
        res.json(referTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReferTypeById = async (req, res) => {
    try {
        const referType = await PatientCRMReferType.findByPk(req.params.id);
        if (referType) {
            res.json(referType);
        } else {
            res.status(404).json({ message: "Refer Type not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createReferType = async (req, res) => {
    try {
        const { name } = req.body;
        const newReferType = await PatientCRMReferType.create({ name });
        res.status(201).json(newReferType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteReferType = async (req, res) => {
    try {
        const result = await PatientCRMReferType.destroy({ where: { referTypeId: req.params.id } });
        if (result) {
            res.json({ message: "Refer Type deleted successfully" });
        } else {
            res.status(404).json({ message: "Refer Type not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllReferTypes,
    getReferTypeById,
    createReferType,
    deleteReferType,
};
