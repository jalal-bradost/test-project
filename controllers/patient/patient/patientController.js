const {
  Patient
} = require("../../../models");

module.exports = {
  // Create a new patient
 

  // Get all patients
  getAllPatients: async (req, res) => {
    try {
      // Fetching all patients with related data
      const patients = await Patient.findAll(
      );
      res.status(200).json(patients);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getPatientById: async (req, res) => {
    try {
      const { id } = req.params;
      const patient = await Patient.findByPk(id);

      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.status(200).json(patient);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
};
