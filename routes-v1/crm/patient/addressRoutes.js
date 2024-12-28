const router = require("../../../config/express");
const {
    getAllAddresses,
    getAddressById,
    createAddress,
    deleteAddress,
} = require("../../../controllers/crm/patient/addressController");

router.get("/v1/crm/address", getAllAddresses);
router.get("/v1/crm/address/:id", getAddressById);
router.post("/v1/crm/address", createAddress);
router.delete("/v1/crm/address/:id", deleteAddress);

module.exports = router;
