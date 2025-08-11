const router = require("../../../config/express");
const passport = require("../../../config/passport");

const {getAllDoctors,createDoctor,deleteDoctor,updateDoctor

} = require("../../../controllers/appointment/doctor/doctorController");
  
 

 

router.get("/v1/doctors", getAllDoctors);

router.post("/v1/doctors", createDoctor);
router.delete("/v1/doctors/:id", deleteDoctor);
router.post("/v1/doctors/:id", updateDoctor);


  module.exports = router;