const router = require("../../../config/express");
const {
    getAllSurgeryTypes,
    getSurgeryTypeById,
    createSurgeryType,
    deleteSurgeryType,
} = require("../../../controllers/research/followup/surgeryTypeResearchController");

router.get("/v1/research/surgery-type-research", getAllSurgeryTypes);
router.get("/v1/research/surgery-type-research/:id", getSurgeryTypeById);
router.post("/v1/research/surgery-type-research", createSurgeryType);
router.delete("/v1/research/surgery-type-research/:id", deleteSurgeryType);

module.exports = router;
