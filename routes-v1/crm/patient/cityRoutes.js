const router = require("../../../config/express");
const {
    getAllCities,
    getCityById,
    createCity,
    deleteCity,
} = require("../../../controllers/crm/patient/cityController");

router.get("/v1/crm/city", getAllCities);
router.get("/v1/crm/city/:id", getCityById);
router.post("/v1/crm/city", createCity);
router.delete("/v1/crm/city/:id", deleteCity);

module.exports = router;