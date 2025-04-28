const router = require("../../../config/express");
const {
  getAllPatients,
  getPatientById,
  createPatient,
  deletePatient,
  importPatientsFromExcel
} = require("../../../controllers/research/followup/patientFollowupController");
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.get("/v1/research/patient-follow-up", getAllPatients);
router.get("/v1/research/patient-follow-up/:id", getPatientById);
router.post("/v1/research/patient-follow-up", createPatient);
router.delete("/v1/research/patient-follow-up/:id", deletePatient);
router.post("/v1/research/patient-follow-up/import",upload.single("file"), importPatientsFromExcel);



module.exports = router;
