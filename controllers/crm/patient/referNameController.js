const { PatientCRMReferName } = require("../../../models");

const getAllReferNames = async (req, res) => {
    try {
        const referNames = await PatientCRMReferName.findAll();
        res.json(referNames);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReferNameById = async (req, res) => {
    try {
        const referName = await PatientCRMReferName.findByPk(req.params.id);
        if (referName) {
            res.json(referName);
        } else {
            res.status(404).json({ message: "Refer Name not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createReferName = async (req, res) => {
    try {
        const { name } = req.body;
        const newReferName = await PatientCRMReferName.create({ name });
        res.status(201).json(newReferName);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteReferName = async (req, res) => {
    try {
        const result = await PatientCRMReferName.destroy({ where: { referNameId: req.params.id } });
        if (result) {
            res.json({ message: "Refer Name deleted successfully" });
        } else {
            res.status(404).json({ message: "Refer Name not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllReferNames,
    getReferNameById,
    createReferName,
    deleteReferName,
};
