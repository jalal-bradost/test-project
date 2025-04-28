const router = require("../../../config/express");
const {
  getUpcomingFollowUps,
  markFollowUpCalled,
  getFollowUpsByPatientId
} = require("../../../controllers/research/followup/followupStageController");

router.get("/v1/research/follow-up-stages/upcoming", getUpcomingFollowUps);
router.put("/v1/research/follow-up-stages/:id/call", markFollowUpCalled);
router.get("/v1/research/patient/follow-up-stages/:patientId", getFollowUpsByPatientId);

module.exports = router;
