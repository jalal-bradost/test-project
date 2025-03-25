const {SurgeryCalendarCRM } = require("../../../models");

const getAllSurgeries = async (req, res) => {
    try {
        const surgeries = await SurgeryCalendarCRM.findAll();
        res.json(surgeries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSurgeryById = async (req, res) => {
    try {
        const surgery = await SurgeryCalendarCRM.findByPk(req.params.id);
        if (surgery) {
            res.json(surgery);
        } else {
            res.status(404).json({ message: "Surgery not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createSurgery = async (req, res) => {
    try {
        const surgeryData = req.body;
        const newSurgery = await SurgeryCalendarCRM.create(surgeryData);
        res.status(201).json(newSurgery);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSurgery = async (req, res) => {
    try {
        const result = await SurgeryCalendarCRM.destroy({ where: { surgeryStatusId: req.params.id } });
        if (result) {
            res.json({ message: "Surgery deleted successfully" });
        } else {
            res.status(404).json({ message: "Surgery not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPatients = async (req, res) => {
    try {
        const patients = await SurgeryCalendarCRM.getPatients();
        res.status(200).json(patients);
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
      }
};


module.exports = {
    getAllSurgeries,
    getSurgeryById,
    createSurgery,
    deleteSurgery,
    getPatients
};
