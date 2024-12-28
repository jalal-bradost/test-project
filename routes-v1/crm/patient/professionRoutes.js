const router = require("../../../config/express");
const {
    getAllProfessions,
    getProfessionById,
    createProfession,
    deleteProfession,
} = require("../../../controllers/crm/patient/professionController");

router.get("/v1/crm/profession", getAllProfessions);
router.get("/v1/crm/profession/:id", getProfessionById);
router.post("/v1/crm/profession", createProfession);
router.delete("/v1/crm/profession/:id", deleteProfession);

module.exports = router;
