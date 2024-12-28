const router = require("../../../config/express");

const {
    getAllReferTypes,
    getReferTypeById,
    createReferType,
    deleteReferType,
} = require("../../../controllers/crm/patient/referTypeController");

router.get("/v1/crm/refer-type", getAllReferTypes);
router.get("/v1/crm/refer-type/:id", getReferTypeById);
router.post("/v1/crm/refer-type", createReferType);
router.delete("/v1/crm/refer-type/:id", deleteReferType);

module.exports = router;