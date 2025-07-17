const router = require("../../../config/express");
const passport = require("../../../config/passport");
const {
    getAllSocialActivityDocuments,
    getSocialActivityDocumentById,
    createSocialActivityDocument,
    deleteSocialActivityDocument,
} = require("../../../controllers/crm/social-activity/socialActivityDocumentsController");

router.get("/v1/crm/social-activity/:socialActivityId/documents",  getAllSocialActivityDocuments);
router.get("/v1/crm/social-activity/:socialActivityId/documents/:documentId", getSocialActivityDocumentById);
router.post("/v1/crm/social-activity/:socialActivityId/documents",passport.authenticate('bearer', { session: false }),  createSocialActivityDocument);
router.delete("/v1/crm/social-activity/:socialActivityId/documents/:documentId",passport.authenticate('bearer', { session: false }),  deleteSocialActivityDocument);

module.exports = router;
