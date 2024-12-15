const { DoctorStage, PatientCRM } = require("../../../models");

module.exports = {
  // Create or use existing patient, then create DoctorStage
  createDoctorStage: async (req, res) => {
    try {
      const { phoneNumber, fullname, birthdate, sex, bloodType, ...doctorStageData } = req.body;

      // Validate or create patient
      const [patient, created] = await PatientCRM.findOrCreate({
        where: { phoneNumber: phoneNumber.trim() },
        defaults: {
          phoneNumber: phoneNumber.trim(),
          fullname,
          birthdate,
          sex,
          bloodType,
        }, // Include all required fields for the PatientCRM
      });

      // Create DoctorStage
      const doctorStage = await DoctorStage.create({
        ...doctorStageData,
        patientId: patient.patientId, // Link DoctorStage to the correct patient
      });

      res.status(201).json({
        message: "DoctorStage record created successfully",
        doctorStage,
        patient,
      });
    } catch (error) {
      console.error("Error in createDoctorStage:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all DoctorStage records
  getAllDoctorStages: async (req, res) => {
    try {
      const doctorStages = await DoctorStage.findAll({
        include: PatientCRM, // Include related PatientCRM records
      });
      res.status(200).json(doctorStages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single DoctorStage record by ID
  getDoctorStageById: async (req, res) => {
    try {
      const { id } = req.params;
      const doctorStage = await DoctorStage.findByPk(id, {
        include: PatientCRM, // Include related PatientCRM records
      });

      if (!doctorStage) {
        return res.status(404).json({ message: "DoctorStage record not found" });
      }

      res.status(200).json(doctorStage);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update a DoctorStage record by ID
  updateDoctorStage: async (req, res) => {
    try {
      const id = req.body.doctorStageId; // Ensure the correct field name is used for ID
      const [updated] = await DoctorStage.update(req.body, {
        where: { doctorStageId: id }, // Match by the new field name "doctorStageId"
      });

      if (!updated) {
        return res.status(404).json({ message: "DoctorStage record not found" });
      }

      const updatedDoctorStage = await DoctorStage.findByPk(id);
      res.status(200).json({ message: "DoctorStage record updated successfully", updatedDoctorStage });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a DoctorStage record by ID
  deleteDoctorStage: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await DoctorStage.destroy({
        where: { doctorStageId: id }, // Match by the new field name "doctorStageId"
      });

      if (!deleted) {
        return res.status(404).json({ message: "DoctorStage record not found" });
      }

      res.status(200).json({ message: "DoctorStage record deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
