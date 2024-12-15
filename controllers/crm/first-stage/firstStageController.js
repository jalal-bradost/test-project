// FirstStage Controller
const { FirstStage,PatientCRM } = require("../../../models");

module.exports = {
  // Create or use existing patient, then create FirstStage
  createFirstStage: async (req, res) => {
    // console.log("Request initiated");
    try {
      const { phoneNumber, fullname, birthdate, sex, bloodType, ...firstStageData } = req.body;

      // console.log("Phone Number:", phoneNumber);

      // Validate or create patient
      const [patient, created] = await PatientCRM.findOrCreate({
        where: { phoneNumber: phoneNumber.trim() },
        defaults: {
          phoneNumber: phoneNumber.trim(),
          fullname,
          birthdate,
          sex,
          bloodType,
        }, // Include all required fields
      });

      // console.log(`Patient ${created ? "created" : "found"}:`, patient);

      // Create FirstStage
      const firstStage = await FirstStage.create({
        ...firstStageData,
        patientId: patient.patientId,
      });

      res.status(201).json({
        message: "FirstStage record created successfully",
        firstStage,
        patient,
      });
    } catch (error) {
      console.error("Error in createFirstStage:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all FirstStage records
  getAllFirstStages: async (req, res) => {
    try {
      console.log('request initiated')
      const firstStages = await FirstStage.findAll({
        include: PatientCRM, // Include related PatientCRM records
      });
      res.status(200).json(firstStages);
    } catch (error) {
      console.log(error)
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
    console.log(req.body)
    try {
      const  id  = req.body.firstStageId;
      const [updated] = await FirstStage.update(req.body, {
        where: { firstStageId: id },
      });

      if (!updated) {
        return res.status(404).json({ message: "FirstStage record not found" });
      }

      const updatedFirstStage = await FirstStage.findByPk(id);
      res.status(200).json({ message: "FirstStage record updated successfully", updatedFirstStage });
    } catch (error) {
      console.log(error)
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

      res.status(200).json({ message: "FirstStage record deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};