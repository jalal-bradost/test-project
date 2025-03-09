const router = require("../../../config/express");
const {
    getAllSurgeryStatuses,
    getSurgeryStatusById,
    createSurgeryStatus,
    deleteSurgeryStatus,
} = require("../../../controllers/crm/surgery-calendar/surgeryStatusController");

router.get("/v1/crm/surgery-status", getAllSurgeryStatuses);
router.get("/v1/crm/surgery-status/:id", getSurgeryStatusById);
router.post("/v1/crm/surgery-status", createSurgeryStatus);
router.delete("/v1/crm/surgery-status/:id", deleteSurgeryStatus);

module.exports = router;
