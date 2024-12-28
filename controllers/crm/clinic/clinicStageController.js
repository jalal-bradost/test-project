const { ClinicStage, PatientCRM } = require("../../../models");

module.exports = {
  // Create or use existing patient, then create ClinicStage
  createClinicStage: async (req, res) => {
    try {
      const { ...clinicStageData } = req.body;

      // Create ClinicStage
      const clinicStage = await ClinicStage.create({
        ...clinicStageData,
      });

      res.status(201).json({
        message: "ClinicStage record created successfully",
        clinicStage,
      });
    } catch (error) {
      console.error("Error in createClinicStage:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all ClinicStage records
  getAllClinicStages: async (req, res) => {
    try {
      const clinicStages = await ClinicStage.findAll({
        include: {
          model: PatientCRM,
          attributes: ["patientId", "fullname", "phoneNumber"],
        }, // Include related PatientCRM records
        attributes:{
            exclude: ["createdAt", "updatedAt"],
        }
      });
      res.status(200).json(clinicStages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  getPatients: async (req, res) => {
    try {
      const patients = await ClinicStage.getPatients();
      res.status(200).json(patients);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single ClinicStage record by ID
  getClinicStageById: async (req, res) => {
    try {
      const { id } = req.params;
      const clinicStage = await ClinicStage.findByPk(id, {
        include: PatientCRM, // Include related PatientCRM records
      });

      if (!clinicStage) {
        return res
          .status(404)
          .json({ message: "ClinicStage record not found" });
      }

      res.status(200).json(clinicStage);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update a ClinicStage record by ID
  updateClinicStage: async (req, res) => {
    try {
      const id = req.body.clinicStageId;
      const [updated] = await ClinicStage.update(req.body, {
        where: { clinicStageId: id },
      });

      if (!updated) {
        return res
          .status(404)
          .json({ message: "ClinicStage record not found" });
      }

      const updatedClinicStage = await ClinicStage.findByPk(id);
      res.status(200).json({
        message: "ClinicStage record updated successfully",
        updatedClinicStage,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a ClinicStage record by ID
  deleteClinicStage: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await ClinicStage.destroy({
        where: { clinicStageId: id },
      });

      if (!deleted) {
        return res
          .status(404)
          .json({ message: "ClinicStage record not found" });
      }

      res
        .status(200)
        .json({ message: "ClinicStage record deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
