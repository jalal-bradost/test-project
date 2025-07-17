const router = require("../../../config/express");

const passport = require("../../../config/passport");
const {
  createFirstStage,
  getAllFirstStages,
  getPatients,
  getFirstStageById,
  updateFirstStage,
  deleteFirstStage,
} = require("../../../controllers/crm/first-stage/firstStageController"); // Adjust the path to your controller

// Create a FirstStage record (if patient does not exist, create the patient first)
router.post('/crm/first-stage',passport.authenticate('bearer', { session: false }), createFirstStage);

// Get all FirstStage records
router.get('/crm/first-stage', getAllFirstStages);

router.get('/crm/first-stage/patients', getPatients);

// Get a single FirstStage record by ID
router.get("/:id", getFirstStageById);

// Update a FirstStage record by ID
router.put("/crm/first-stage",passport.authenticate('bearer', { session: false }), updateFirstStage);

// Delete a FirstStage record by ID
router.delete("/crm/first-stage/:id",passport.authenticate('bearer', { session: false }), deleteFirstStage);

module.exports = router;
