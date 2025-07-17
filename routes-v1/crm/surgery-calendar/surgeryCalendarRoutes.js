const router = require("../../../config/express");
const passport = require("../../../config/passport");
const {
    getAllSurgeries,
    getSurgeryById,
    createSurgery,
    updateSurgery,
    deleteSurgery,
    getPatients
} = require("../../../controllers/crm/surgery-calendar/surgeryCalendarController");

router.get("/v1/crm/surgery-calendar", getAllSurgeries);
router.get("/v1/crm/surgery-calendar/patients", getPatients);
router.get("/v1/crm/surgery-calendar/:id", getSurgeryById);
router.post("/v1/crm/surgery-calendar",passport.authenticate('bearer', { session: false }), createSurgery);
router.put("/v1/crm/surgery-calendar",passport.authenticate('bearer', { session: false }), updateSurgery);
router.delete("/v1/crm/surgery-calendar/:id",passport.authenticate('bearer', { session: false }), deleteSurgery);

module.exports = router;
