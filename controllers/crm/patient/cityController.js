const { PatientCRMCity } = require("../../../models");

const getAllCities = async (req, res) => {
    try {
        const cities = await PatientCRMCity.findAll();
        res.json(cities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCityById = async (req, res) => {
    try {
        const city = await PatientCRMCity.findByPk(req.params.id);
        if (city) {
            res.json(city);
        } else {
            res.status(404).json({ message: "City not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCity = async (req, res) => {
    try {
        const { name } = req.body;
        const newCity = await PatientCRMCity.create({ name });
        res.status(201).json(newCity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCity = async (req, res) => {
    try {
        const result = await PatientCRMCity.destroy({ where: { cityId: req.params.id } });
        if (result) {
            res.json({ message: "City deleted successfully" });
        } else {
            res.status(404).json({ message: "City not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllCities,
    getCityById,
    createCity,
    deleteCity,
};
