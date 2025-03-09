const router = require("../../../config/express");
const {
    getAllSurgeries,
    getSurgeryById,
    createSurgery,
    // updateSurgery,
    deleteSurgery,
    getPatients
} = require("../../../controllers/crm/surgery-calendar/surgeryCalendarController");

router.get("/v1/crm/surgery-calendar", getAllSurgeries);
router.get("/v1/crm/surgery-calendar/patients", getPatients);
router.get("/v1/crm/surgery-calendar/:id", getSurgeryById);
router.post("/v1/crm/surgery-calendar", createSurgery);
// router.put("/v1/crm/surgery-calendar", updateSurgery);
router.delete("/v1/crm/surgery-calendar/:id", deleteSurgery);

module.exports = router;
