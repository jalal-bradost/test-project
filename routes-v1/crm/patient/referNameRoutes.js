const router = require("../../../config/express");

const {
    getAllReferNames,
    getReferNameById,
    createReferName,
    deleteReferName,
} = require("../../../controllers/crm/patient/referNameController");

router.get("/v1/crm/refer-name", getAllReferNames);
router.get("/v1/crm/refer-name/:id", getReferNameById);
router.post("/v1/crm/refer-name", createReferName);
router.delete("/v1/crm/refer-name/:id", deleteReferName);

module.exports = router;
