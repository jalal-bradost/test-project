const router = require("../../config/express");
const passport = require("../../config/passport");

const {getAllAppointments,createAppointment,
       getAppointmentById,updateAppointment,
       deleteAppointment,allAppointmentPatient,updateAppointmentData

} = require("../../controllers/appointment/appointmentController");
  const { param, body } = require("express-validator");


 


router.get("/v1/appointment", getAllAppointments);

router.post("/v1/appointment", createAppointment);
router.post("/v1/appointment/:id", updateAppointment);
router.get("/v1/appointment/:id", getAppointmentById);
router.delete("/v1/appointment/:id", deleteAppointment);
router.get("/v1/allappointment/patient/:id", allAppointmentPatient);
router.put(
  "/v1/appointments/:appointmentId/:patientID/data",updateAppointmentData
);
  module.exports = router;