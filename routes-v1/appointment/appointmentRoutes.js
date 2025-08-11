const router = require("../../config/express");
const passport = require("../../config/passport");

const {getAllAppointments,createAppointment,
       getAppointmentById,updateAppointment,
       deleteAppointment,allAppointmentPatient

} = require("../../controllers/appointment/appointmentController");
  
 


router.get("/v1/appointment", getAllAppointments);

router.post("/v1/appointment", createAppointment);
router.post("/v1/appointment/:id", updateAppointment);
router.get("/v1/appointment/:id", getAppointmentById);
router.delete("/v1/appointment/:id", deleteAppointment);
router.get("/v1/allappointment/patient/:id", allAppointmentPatient);
  module.exports = router;