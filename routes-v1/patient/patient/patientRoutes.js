const router = require("../../../config/express");
const passport = require("../../../config/passport");

const {
    getAllPatients,
    getPatientById
  } = require("../../../controllers/patient/patient/patientController");
  
 

  // Get all patients
  router.get("/v1/patient", getAllPatients);
// Get a one patient by ID
  router.get("/v1/patient/:id", getPatientById);
  


  module.exports = router;