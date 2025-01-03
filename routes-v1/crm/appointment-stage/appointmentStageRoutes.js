const router = require("../../../config/express");
const passport = require("../../../config/passport");
const {
  createAppointment,   // Controller function for creating an Appointment
  getAllAppointments,  // Controller function for getting all Appointment records
  getPatients,
  getAppointmentById,  // Controller function for getting an Appointment by ID
  updateAppointment,   // Controller function for updating an Appointment record
  deleteAppointment,   // Controller function for deleting an Appointment record
} = require("../../../controllers/crm/appointment-stage/appointmentStageController"); // Adjust path to your AppointmentController

// Create an Appointment record
router.post('/v1/crm/appointment-stage', createAppointment);

// Get all Appointment records
router.get('/v1/crm/appointment-stage', getAllAppointments);

// Get all Patient records
router.get('/v1/crm/appointment-stage/patients', getPatients);

// Get a single Appointment record by ID
router.get('/v1/crm/appointment-stage/:id', getAppointmentById);

// Update an Appointment record by ID
router.put('/v1/crm/appointment-stage', updateAppointment);

// Delete an Appointment record by ID
router.delete('/v1/crm/appointment-stage/:id', deleteAppointment);

module.exports = router;
