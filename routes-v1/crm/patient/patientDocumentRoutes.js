const router = require("../../../config/express");
const {
    getAllPatientDocuments,
    getPatientDocumentById,
    createPatientDocument,
    deletePatientDocument,
} = require("../../../controllers/crm/patient/patientDocumentController");

router.get("/v1/crm/patient/:patientId/documents", getAllPatientDocuments);
router.get("/v1/crm/patient/:patientId/documents/:documentId", getPatientDocumentById);
router.post("/v1/crm/patient/:patientId/documents", createPatientDocument);
router.delete("/v1/crm/patient/:patientId/documents/:documentId", deletePatientDocument);

module.exports = router;
