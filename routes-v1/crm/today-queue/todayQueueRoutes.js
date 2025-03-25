const router = require("../../../config/express");
const passport = require("../../../config/passport");
const {
  getAllAppointments,  // Controller function for getting all Appointment records
  getPatients,
} = require("../../../controllers/crm/today-queue/todayQueueController"); // Adjust path to your AppointmentController



// Get all today Appointment records
router.get('/v1/crm/today-queue', getAllAppointments);

// Get all Patient records
router.get('/v1/crm/appointment-stage/patients', getPatients);


module.exports = router;
