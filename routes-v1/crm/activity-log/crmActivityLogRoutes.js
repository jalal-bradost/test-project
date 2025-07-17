const router = require("../../../config/express");
const passport = require("../../../config/passport");
const {
  getActivityLogsByPatientId, // Controller function for getting activity logs by patient ID
} = require("../../../controllers/crm/activity-log/crmActivityLogController"); // Adjust the

// path to your controller
// Get activity logs by patient ID
router.get('/v1/crm/activity-log/patient/:patientId', passport.authenticate('bearer', { session: false }), getActivityLogsByPatientId);