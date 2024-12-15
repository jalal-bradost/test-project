const { PatientCRM } = require("../../../models");

module.exports = {
  // Create a new patient
  createPatient: async (req, res) => {
    try {
      const patient = await PatientCRM.create(req.body);
      res.status(201).json({ message: "Patient created successfully", patient });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all patients
  getAllPatients: async (req, res) => {
    try {
      const patients = await PatientCRM.findAll();
      res.status(200).json(patients);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single patient by ID
  getPatientById: async (req, res) => {
    try {
      const { id } = req.params;
      const patient = await PatientCRM.findByPk(id);

      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.status(200).json(patient);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update a patient by ID
  updatePatient: async (req, res) => {
    try {
      const { id } = req.params;
      const [updated] = await PatientCRM.update(req.body, {
        where: { patientId: id },
      });

      if (!updated) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const updatedPatient = await PatientCRM.findByPk(id);
      res.status(200).json({ message: "Patient updated successfully", updatedPatient });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a patient by ID
  deletePatient: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await PatientCRM.destroy({
        where: { patientId: id },
      });

      if (!deleted) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.status(200).json({ message: "Patient deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};