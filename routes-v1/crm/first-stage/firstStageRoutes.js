const router = require("../../../config/express");
const {
  createFirstStage,
  getAllFirstStages,
  getPatients,
  getFirstStageById,
  updateFirstStage,
  deleteFirstStage,
} = require("../../../controllers/crm/first-stage/firstStageController"); // Adjust the path to your controller

// Create a FirstStage record (if patient does not exist, create the patient first)
router.post('/crm/first-stage', createFirstStage);

// Get all FirstStage records
router.get('/crm/first-stage', getAllFirstStages);

router.get('/crm/first-stage/patients', getPatients);

// Get a single FirstStage record by ID
router.get("/:id", getFirstStageById);

// Update a FirstStage record by ID
router.put("/crm/first-stage", updateFirstStage);

// Delete a FirstStage record by ID
router.delete("/crm/first-stage/:id", deleteFirstStage);

module.exports = router;
