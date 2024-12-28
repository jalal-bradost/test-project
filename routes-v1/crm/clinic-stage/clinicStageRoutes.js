const router = require("../../../config/express");
const {
  createClinicStage,
  getAllClinicStages,
  getPatients,
  getClinicStageById,
  updateClinicStage,
  deleteClinicStage,
} = require("../../../controllers/crm/clinic/clinicStageController"); // Adjust the path to your controller

// Create a ClinicStage record (if patient does not exist, create the patient first)
router.post('/v1/crm/clinic-stage', createClinicStage);

// Get all ClinicStage records
router.get('/v1/crm/clinic-stage', getAllClinicStages);

// Get patients associated with ClinicStage
router.get('/v1/crm/clinic-stage/patients', getPatients);

// Get a single ClinicStage record by ID
router.get('/v1/crm/clinic-stage/:id', getClinicStageById);

// Update a ClinicStage record by ID
router.put('/v1/crm/clinic-stage', updateClinicStage);

// Delete a ClinicStage record by ID
router.delete('/v1/crm/clinic-stage/:id', deleteClinicStage);

module.exports = router;
