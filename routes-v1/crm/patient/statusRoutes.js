const router = require("../../../config/express");

const {
    getAllStatuses,
    getStatusById,
    createStatus,
    deleteStatus,
} = require("../../../controllers/crm/patient/statusController");

router.get("/v1/crm/status", getAllStatuses);
router.get("/v1/crm/status/:id", getStatusById);
router.post("/v1/crm/status", createStatus);
router.delete("/v1/crm/status/:id", deleteStatus);

module.exports = router;