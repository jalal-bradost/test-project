const router = require("../../../config/express");
const passport = require("../../../config/passport");

const {getAllPurpose,getPurposeById,createPurpose,updatePurpose,deletePurpose

} = require("../../../controllers/appointment/Purposes/purposeController");
  
 
router.get("/v1/purpose",       getAllPurpose);
router.get("/v1/purpose/:id",   getPurposeById);
router.post("/v1/purpose",       createPurpose);
router.delete("/v1/purpose/:id", deletePurpose);
router.post("/v1/purpose/:id",   updatePurpose);



module.exports = router;