const { DoctorStage, PatientCRM,PatientCRMStatus, sequelize } = require("../../../models");

module.exports = {
  // Create or use existing patient, then create DoctorStage
  createDoctorStage: async (req, res) => {
    try {
      const { patientId, statusId, ...doctorStageData } = req.body;

      // Retrieve and update PatientCRM record
      const patient = await PatientCRM.findByPk(patientId);
      if (!patient) {
        return res.status(404).json({
          message: "Patient record not found. Unable to proceed with DoctorStage creation.",
        });
      }

      // Update the statusId of the PatientCRM record
      await patient.update({ statusId });

      // Create DoctorStage
      const doctorStage = await DoctorStage.create({
        patientId,
        ...doctorStageData,
      });

      res.status(201).json({
        message: "DoctorStage record created successfully and patient status updated.",
        doctorStage,
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
        include: {
          model: PatientCRM,
          attributes: ['patientId', 'fullname', 'phoneNumber'],
          where: { isActive: true },
          include: {
            model: PatientCRMStatus,
            attributes: ["name", "statusId"],
            as: "status",
          },
        },
      });
      res.status(200).json(doctorStages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  getPatients: async (req, res) => {
    try {
      const patients = await DoctorStage.getPatients();
      res.status(200).json(patients);
    } catch (error) {
      console.log(error)
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
    const transaction = await sequelize.transaction(); // Start transaction
    

    try {
      const { doctorStageId, ...doctorStageData } = req.body;

      // Retrieve the associated DoctorStage record
      const doctorStage = await DoctorStage.findByPk(doctorStageId, {
        include: [{ model: PatientCRM, as: "PatientCRM" }],
        transaction,
      });

      if (!doctorStage) {
        await transaction.rollback();
        return res.status(404).json({ message: "DoctorStage record not found." });
      }

      // If necessary, update associated data (e.g., PatientCRM)
      if (doctorStageData.PatientCRM && doctorStageData.PatientCRM.status) {
        const { statusId } = doctorStageData.PatientCRM.status;

        // Ensure that the associated PatientCRM exists
        if (!doctorStage.PatientCRM) {
          await transaction.rollback();
          return res.status(404).json({ message: "Associated PatientCRM not found." });
        }

        // Update the PatientCRM status
        const patientCRMUpdateResult = await PatientCRM.update(
          { statusId },
          { where: { patientId: doctorStage.PatientCRM.patientId }, transaction }
        );

        if (!patientCRMUpdateResult[0]) {
          await transaction.rollback();
          return res
            .status(404)
            .json({ message: "PatientCRM record not found for the given patientId." });
        }
      }

      // Update the DoctorStage record with the new data
      const [updated] = await DoctorStage.update(doctorStageData, {
        where: { doctorStageId },
        transaction,
      });

      if (!updated) {
        await transaction.rollback();
        return res.status(404).json({ message: "DoctorStage record not found." });
      }

      // Fetch the updated DoctorStage record
      // const updatedDoctorStage = await DoctorStage.findByPk(doctorStageId, {
      //   include: [{ model: PatientCRM, as: "PatientCRM" }],
      //   transaction,
      // });

      await transaction.commit();
      res.status(200).json({
        message: "DoctorStage updated successfully.",
        // updatedDoctorStage,
      });
    } catch (error) {
      console.error(error);
      await transaction.rollback();
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
