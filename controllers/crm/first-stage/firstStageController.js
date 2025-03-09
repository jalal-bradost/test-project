// FirstStage Controller
const { FirstStage, PatientCRM, PatientCRMStatus,sequelize } = require("../../../models");

module.exports = {
  // Create or use existing patient, then create FirstStage
  createFirstStage: async (req, res) => {
    // console.log("Request initiated");
    try {
      const { patientId, statusId, ...firstStageData } = req.body;

      // Retrieve and update PatientCRM record
      const patient = await PatientCRM.findByPk(patientId);
      if (!patient) {
        return res.status(404).json({
          message:
            "Patient record not found. Unable to proceed with FirstStage creation.",
        });
      }

      // Update the statusId of the PatientCRM record
      await patient.update({ statusId });

      // Create FirstStage
      const firstStage = await FirstStage.create({
        patientId,
        ...firstStageData,
      });

      res.status(201).json({
        message: "FirstStage record created successfully",
        firstStage,
      });
    } catch (error) {
      console.error("Error in createFirstStage:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all FirstStage records
  getAllFirstStages: async (req, res) => {
    try {
      const firstStages = await FirstStage.findAll({
        include: {
          model: PatientCRM, // Include related PatientCRM records
          attributes: ["patientId", "fullname", "phoneNumber",],
          where: { isActive: true },
          include: {
            model: PatientCRMStatus,
            attributes: ["name", "statusId"],
            as: "status",
          },
        },
      });
      res.status(200).json(firstStages);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  },

  getPatients: async (req, res) => {
    try {
      const patients = await FirstStage.getPatients();
      res.status(200).json(patients);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single FirstStage record by ID
  getFirstStageById: async (req, res) => {
    try {
      const { id } = req.params;
      const firstStage = await FirstStage.findByPk(id, {
        include: PatientCRM, // Include related PatientCRM records
      });

      if (!firstStage) {
        return res.status(404).json({ message: "FirstStage record not found" });
      }

      res.status(200).json(firstStage);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update a FirstStage record by ID
  updateFirstStage: async (req, res) => {
    console.log(req.body);
    const transaction = await sequelize.transaction(); // Start transaction
    try {
      const { firstStageId, ...firstStageData } = req.body;
  
      // Validate and update PatientCRM status if provided
      if (firstStageData.PatientCRM && firstStageData.PatientCRM.status) {
        const { statusId } = firstStageData.PatientCRM.status;
  
        // Retrieve the associated PatientCRM from the FirstStage
        const firstStage = await FirstStage.findByPk(firstStageId, {
          include: [{ model: PatientCRM, as: "PatientCRM" }],
          transaction,
        });
  
        if (!firstStage || !firstStage.PatientCRM) {
          await transaction.rollback();
          return res
            .status(404)
            .json({ message: "Associated PatientCRM record not found." });
        }
  
        // Update PatientCRM status
        const patientCRMUpdateResult = await PatientCRM.update(
          { statusId },
          { where: { patientId: firstStage.PatientCRM.patientId }, transaction }
        );
  
        if (!patientCRMUpdateResult[0]) {
          await transaction.rollback();
          return res
            .status(404)
            .json({
              message: "PatientCRM record not found for the given patientId.",
            });
        }
      }
  
      // Update the FirstStage record with the new data
      const [updated] = await FirstStage.update(firstStageData, {
        where: { firstStageId },
        transaction,
      });
  
      if (!updated) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ message: "FirstStage record not found." });
      }
  
      // Fetch the updated FirstStage record
      // const updatedFirstStage = await FirstStage.findByPk(firstStageId, {
      //   include: [{ model: PatientCRM, as: "PatientCRM" }],
      //   transaction,
      // });
  
      await transaction.commit();
      res.status(200).json({
        message: "FirstStage updated successfully.",
        // firstStage: updatedFirstStage,
      });
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a FirstStage record by ID
  deleteFirstStage: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await FirstStage.destroy({
        where: { firstStageId: id },
      });

      if (!deleted) {
        return res.status(404).json({ message: "FirstStage record not found" });
      }

      res
        .status(200)
        .json({ message: "FirstStage record deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
