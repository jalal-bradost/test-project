const router = require("../../../config/express");

const {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
  } = require("../../../controllers/crm/patient/patientController");
  
  // Create a new patient
  router.post("/v1/crm/patient", createPatient);
  
  // Get all patients
  router.get("/v1/crm/patient", getAllPatients);
  
  // Get a single patient by ID
  router.get("/v1/crm/patient/:id", getPatientById);
  
  // Update a patient by ID
  router.put("/v1/crm/patient", updatePatient);
  
  // Delete a patient by ID
  router.delete("/v1/crm/patient/:id", deletePatient);
  
  module.exports = router;