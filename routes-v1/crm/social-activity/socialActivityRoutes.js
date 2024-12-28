const router = require("../../../config/express");
const passport = require("../../../config/passport");
const {
  createSocialActivity,
  getAllSocialActivities,
  getPatients,
  getSocialActivityById,
  updateSocialActivity,
  deleteSocialActivity,
} = require("../../../controllers/crm/social-activity/socialActivityController"); // Adjust the path to your controller

// Create a SocialActivity record
router.post('/v1/crm/social-activity',passport.authenticate('bearer', { session: false }), createSocialActivity);

// Get all SocialActivity records
router.get('/v1/crm/social-activity', getAllSocialActivities);

// Get patients related to SocialActivity
router.get('/v1/crm/social-activity/patients', getPatients);

// Get a single SocialActivity record by ID
router.get('/v1/crm/social-activity/:id', getSocialActivityById);

// Update a SocialActivity record by ID
router.put('/v1/crm/social-activity', updateSocialActivity);

// Delete a SocialActivity record by ID
router.delete('/v1/crm/social-activity/:id', deleteSocialActivity);

module.exports = router;