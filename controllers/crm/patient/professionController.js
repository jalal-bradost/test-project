const { PatientCRMProfession } = require("../../../models");

const getAllProfessions = async (req, res) => {
    try {
        const professions = await PatientCRMProfession.findAll();
        res.json(professions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfessionById = async (req, res) => {
    try {
        const profession = await PatientCRMProfession.findByPk(req.params.id);
        if (profession) {
            res.json(profession);
        } else {
            res.status(404).json({ message: "Profession not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createProfession = async (req, res) => {
    try {
        const { name } = req.body;
        const newProfession = await PatientCRMProfession.create({ name });
        res.status(201).json(newProfession);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProfession = async (req, res) => {
    try {
        const result = await PatientCRMProfession.destroy({ where: { professionId: req.params.id } });
        if (result) {
            res.json({ message: "Profession deleted successfully" });
        } else {
            res.status(404).json({ message: "Profession not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllProfessions,
    getProfessionById,
    createProfession,
    deleteProfession,
};
