const router = require("../../../config/express");
const {
    getAllSocialActivityDocuments,
    getSocialActivityDocumentById,
    createSocialActivityDocument,
    deleteSocialActivityDocument,
} = require("../../../controllers/crm/social-activity/socialActivityDocumentsController");

router.get("/v1/crm/social-activity/:socialActivityId/documents", getAllSocialActivityDocuments);
router.get("/v1/crm/social-activity/:socialActivityId/documents/:documentId", getSocialActivityDocumentById);
router.post("/v1/crm/social-activity/:socialActivityId/documents", createSocialActivityDocument);
router.delete("/v1/crm/social-activity/:socialActivityId/documents/:documentId", deleteSocialActivityDocument);

module.exports = router;
