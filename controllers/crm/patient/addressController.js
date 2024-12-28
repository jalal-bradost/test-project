const { PatientCRMAddress } = require("../../../models");

const getAllAddresses = async (req, res) => {
    try {
        const addresses = await PatientCRMAddress.findAll();
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAddressById = async (req, res) => {
    try {
        const address = await PatientCRMAddress.findByPk(req.params.id);
        if (address) {
            res.json(address);
        } else {
            res.status(404).json({ message: "Address not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAddress = async (req, res) => {
    try {
        const { name } = req.body;
        const newAddress = await PatientCRMAddress.create({ name });
        res.status(201).json(newAddress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const result = await PatientCRMAddress.destroy({ where: { addressId: req.params.id } });
        if (result) {
            res.json({ message: "Address deleted successfully" });
        } else {
            res.status(404).json({ message: "Address not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllAddresses,
    getAddressById,
    createAddress,
    deleteAddress,
};
