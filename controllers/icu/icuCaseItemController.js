const { IcuCaseItem, IcuCase } = require("../../models");

const createIcuCaseItem = async (req, res) => {
    const icuCaseId = req.params.icuCaseId;
    const icuCaseItemData = req.body;
    try {
        const icuCase = await IcuCase.findByPk(icuCaseId);
        if (!icuCase) {
            return res.status(404).json({ error: 'ICU case not found' });
        }
        const icuCaseItem = await IcuCaseItem.create({ ...icuCaseItemData, icuCaseId });
        return res.status(201).json(icuCaseItem);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const updateIcuCaseItem = async (req, res) => {
    const icuCaseItemId = req.params.icuCaseItemId;
    const icuCaseItemData = req.body;
    try {
        const icuCaseItem = await IcuCaseItem.findByPk(icuCaseItemId);
        if (!icuCaseItem) {
            return res.status(404).json({ error: 'ICU case item not found' });
        }
        delete icuCaseItemData.icuCaseItemId;
        await icuCaseItem.update(icuCaseItemData);
        return res.status(204).json({ message: 'ICU case item updated' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const deleteIcuCaseItem = async (req, res) => {
    const icuCaseItemId = req.params.icuCaseItemId;
    try {
        const icuCaseItem = await IcuCaseItem.findByPk(icuCaseItemId);
        if (!icuCaseItem) {
            return res.status(404).json({ error: 'ICU case item not found' });
        }
        await icuCaseItem.destroy();
        return res.status(200).json({ message: 'ICU case item deleted' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const getIcuCaseItems = async (req, res) => {
    const icuCaseId = req.params.icuCaseId;
    try {
        const icuCase = await IcuCase.findByPk(icuCaseId);
        if (!icuCase) {
            return res.status(404).json({ error: 'ICU case not found' });
        }
        const icuCaseItems = await IcuCaseItem.findAll({ where: { icuCaseId } });
        return res.status(200).json(icuCaseItems);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const getIcuCaseItem = async (req, res) => {
    const icuCaseItemId = req.params.icuCaseItemId;
    try {
        const icuCaseItem = await IcuCaseItem.findByPk(icuCaseItemId);
        if (!icuCaseItem) {
            return res.status(404).json({ error: 'ICU case item not found' });
        }
        return res.status(200).json(icuCaseItem);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createIcuCaseItem,
    updateIcuCaseItem,
    deleteIcuCaseItem,
    getIcuCaseItems,
    getIcuCaseItem,
};