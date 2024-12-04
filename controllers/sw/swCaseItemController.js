const { SwCaseItem, SwCase } = require("../../models");

const createSwCaseItem = async (req, res) => {
    const swCaseId = req.params.swCaseId;
    const swCaseItemData = req.body;
    try {
        const swCase = await SwCase.findByPk(swCaseId);
        if (!swCase) {
            return res.status(404).json({ error: 'SW case not found' });
        }
        const swCaseItem = await SwCaseItem.create({ ...swCaseItemData, swCaseId });
        return res.status(201).json(swCaseItem);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const updateSwCaseItem = async (req, res) => {
    const swCaseItemId = req.params.swCaseItemId;
    const swCaseItemData = req.body;
    try {
        const swCaseItem = await SwCaseItem.findByPk(swCaseItemId);
        if (!swCaseItem) {
            return res.status(404).json({ error: 'SW case item not found' });
        }
        delete swCaseItemData.swCaseItemId;
        await swCaseItem.update(swCaseItemData);
        return res.status(204).json({ message: 'SW case item updated' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const deleteSwCaseItem = async (req, res) => {
    const swCaseItemId = req.params.swCaseItemId;
    try {
        const swCaseItem = await SwCaseItem.findByPk(swCaseItemId);
        if (!swCaseItem) {
            return res.status(404).json({ error: 'SW case item not found' });
        }
        await swCaseItem.destroy();
        return res.status(200).json({ message: 'SW case item deleted' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const getSwCaseItems = async (req, res) => {
    const swCaseId = req.params.swCaseId;
    try {
        const swCase = await SwCase.findByPk(swCaseId);
        if (!swCase) {
            return res.status(404).json({ error: 'SW case not found' });
        }
        const swCaseItems = await SwCaseItem.findAll({ where: { swCaseId } });
        return res.status(200).json(swCaseItems);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const getSwCaseItem = async (req, res) => {
    const swCaseItemId = req.params.swCaseItemId;
    try {
        const swCaseItem = await SwCaseItem.findByPk(swCaseItemId);
        if (!swCaseItem) {
            return res.status(404).json({ error: 'SW case item not found' });
        }
        return res.status(200).json(swCaseItem);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createSwCaseItem,
    updateSwCaseItem,
    deleteSwCaseItem,
    getSwCaseItems,
    getSwCaseItem,
};