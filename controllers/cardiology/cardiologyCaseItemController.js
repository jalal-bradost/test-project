const { CardiologyCase, CardiologyCaseItem } = require("../../models");

const createCardiologyCaseItem = async (req, res) => {
    const cardiologyCaseId = req.params.cardiologyCaseId;
    const cardiologyCaseItemData = req.body;
    try {
        const cardiologyCase = await CardiologyCase.findByPk(cardiologyCaseId);
        if (!cardiologyCase) {
            return res.status(404).json({ error: 'Cardiology case not found' });
        }
        const cardiologyCaseItem = await CardiologyCaseItem.create({ ...cardiologyCaseItemData, swCaseId });
        return res.status(201).json(cardiologyCaseItem);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const updateCardiologyCaseItem = async (req, res) => {
    const cardiologyCaseItemId = req.params.cardiologyCaseItemId;
    const cardiologyCaseItemData = req.body;
    try {
        const cardiologyCaseItem = await CardiologyCaseItem.findByPk(cardiologyCaseItemId);
        if (!cardiologyCaseItem) {
            return res.status(404).json({ error: 'Cardiology case item not found' });
        }
        delete cardiologyCaseItemData.cardiologyCaseItemId;
        await cardiologyCaseItem.update(cardiologyCaseItemData);
        return res.status(204).json({ message: 'Cardiology case item updated' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const deleteCardiologyCaseItem = async (req, res) => {
    const cardiologyCaseItemId = req.params.cardiologyCaseItemId;
    try {
        const cardiologyCaseItem = await CardiologyCaseItem.findByPk(cardiologyCaseItemId);
        if (!cardiologyCaseItem) {
            return res.status(404).json({ error: 'Cardiology case item not found' });
        }
        await cardiologyCaseItem.destroy();
        return res.status(200).json({ message: 'Cardiology case item deleted' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const getCardiologyCaseItems = async (req, res) => {
    const cardiologyCaseId = req.params.cardiologyCaseId;
    try {
        const cardiologyCase = await CardiologyCase.findByPk(cardiologyCaseId);
        if (!cardiologyCase) {
            return res.status(404).json({ error: 'Cardiology case not found' });
        }
        const cardiologyCaseItems = await CardiologyCaseItem.findAll({ where: { cardiologyCaseId } });
        return res.status(200).json(cardiologyCaseItems);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const getCardiologyCaseItem = async (req, res) => {
    const cardiologyCaseItemId = req.params.cardiologyCaseItemId;
    try {
        const cardiologyCaseItem = await CardiologyCaseItem.findByPk(cardiologyCaseItemId);
        if (!cardiologyCaseItem) {
            return res.status(404).json({ error: 'Cardiology case item not found' });
        }
        return res.status(200).json(cardiologyCaseItem);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createCardiologyCaseItem,
    updateCardiologyCaseItem,
    deleteCardiologyCaseItem,
    getCardiologyCaseItems,
    getCardiologyCaseItem,
};