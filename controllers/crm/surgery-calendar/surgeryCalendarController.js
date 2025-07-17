const {SurgeryCalendarCRM,CrmActivityLog } = require("../../../models");

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
        // Log the activity
        const createdBy = req.user.userId;
        await CrmActivityLog.create({
            stage: "Surgery Created",
            createdBy,
            objectType: "SurgeryCalendarCRM",
            objectId: newSurgery.surgeryCalendarId,
            patientId: newSurgery.patientId, // Assuming patientId is part of the new record
            note: `Surgery created with ID: ${newSurgery.surgeryCalendarId}, name: ${newSurgery.surgeryName}`,
        });
        res.status(201).json(newSurgery);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSurgery = async (req, res) => {
    try {
        const result = await SurgeryCalendarCRM.destroy({ where: { surgeryStatusId: req.params.id } });
        if (result) {
            // Log the activity
            const createdBy = req.user.userId;
            await CrmActivityLog.create({
                stage: "Surgery Deleted",
                createdBy,
                objectType: "SurgeryCalendarCRM",
                objectId: req.params.id,
                note: `Surgery deleted with ID: ${req.params.id}`,
            });

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

const updateSurgery = async (req, res) => {
    try {
        const { surgeryCalendarId, ...updatedData } = req.body; // Destructure surgeryCalendarId from the body
        if (!surgeryCalendarId) {
            return res.status(400).json({ message: "surgeryCalendarId is required for update." });
        }

        const [numberOfAffectedRows, updatedSurgery] = await SurgeryCalendarCRM.update(updatedData, {
            where: { surgeryCalendarId: surgeryCalendarId },
            returning: true, // This option is for PostgreSQL and returns the updated record(s)
        });

        if (numberOfAffectedRows > 0) {
            // Log the activity
            const createdBy = req.user.userId;
            await CrmActivityLog.create({
                stage: "Surgery Updated",
                createdBy,
                objectType: "SurgeryCalendarCRM",
                objectId: surgeryCalendarId,
                patientId: updatedSurgery[0].patientId, // Assuming patientId is part of the updated record
                note: `Surgery updated with ID: ${surgeryCalendarId}`,
            });
            res.json(updatedSurgery[0]); // Return the updated record
        } else {
            res.status(404).json({ message: "Surgery not found or no changes made." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getAllSurgeries,
    getSurgeryById,
    createSurgery,
    updateSurgery,
    deleteSurgery,
    getPatients
};
