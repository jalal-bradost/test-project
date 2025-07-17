const router = require("../../../config/express");
const passport = require("../../../config/passport");
const {
  createDoctorStage,   // Updated controller function for creating a DoctorStage
  getAllDoctorStages,  // Updated controller function for getting all DoctorStage records
  getPatients,
  getDoctorStageById,  // Updated controller function for getting a DoctorStage by ID
  updateDoctorStage,   // Updated controller function for updating a DoctorStage record
  deleteDoctorStage,   // Updated controller function for deleting a DoctorStage record
} = require("../../../controllers/crm/doctor-stage/doctorStageController"); // Adjusted path to the new controller

// Create a DoctorStage record (if patient does not exist, create the patient first)
router.post('/crm/doctor-stage',passport.authenticate('bearer', { session: false }), createDoctorStage);

// Get all DoctorStage records
router.get('/crm/doctor-stage', getAllDoctorStages);

// Get all Patient records
router.get('/crm/doctor-stage/patients', getPatients);

// Get a single DoctorStage record by ID
router.get("/crm/doctor-stage/:id", getDoctorStageById); 

// Update a DoctorStage record by ID
router.put("/crm/doctor-stage",passport.authenticate('bearer', { session: false }), updateDoctorStage);

// Delete a DoctorStage record by ID
router.delete("/crm/doctor-stage/:id",passport.authenticate('bearer', { session: false }), deleteDoctorStage);

module.exports = router;
