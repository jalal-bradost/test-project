const router = require("../../../config/express");
const {
    getAllSurgeryTypes,
    getSurgeryTypeById,
    createSurgeryType,
    deleteSurgeryType,
} = require("../../../controllers/crm/surgery-calendar/surgeryTypeController");

router.get("/v1/crm/surgery-type", getAllSurgeryTypes);
router.get("/v1/crm/surgery-type/:id", getSurgeryTypeById);
router.post("/v1/crm/surgery-type", createSurgeryType);
router.delete("/v1/crm/surgery-type/:id", deleteSurgeryType);

module.exports = router;
