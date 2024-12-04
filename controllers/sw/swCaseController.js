const { SwCase, SurgeryCase, IcuCase, IcuCaseItem, SwCaseItem} = require("../../models");

const createSwCase = async (req, res) => {
    const swCaseData = req.body;
    try {
        const swCase = await SwCase.create(swCaseData);
        return res.status(201).json(swCase);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const updateSwCase = async (req, res) => {
    const swCaseId = req.params.swCaseId;
    const swCaseData = req.body;
    try {
        const swCase = await SwCase.findByPk(swCaseId);
        if (!swCase) {
            return res.status(404).json({ error: 'SW case not found' });
        }
        delete swCaseData.swCaseId;
        delete swCaseData.surgeryCaseId;
        await swCase.update(swCaseData);
        return res.status(204).json({ message: 'SW case updated' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const deleteSwCase = async (req, res) => {
    const swCaseId = req.params.swCaseId;
    try {
        const swCase = await SwCase.findByPk(swCaseId, {include: [{model: SwCaseItem, as: "items"}]});
        if (!swCase) {
            return res.status(404).json({error: 'SW case not found'});
        }
        if (swCase.items.length > 0) {
            return res.status(400).json({error: 'SW case has items, cannot delete'});
        }
        await swCase.destroy();
        return res.status(200).json({ message: 'SW case deleted' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const getSwCases = async (req, res) => {
    try {
        const swCases = await SwCase.findAll({
            include: {
                model: SurgeryCase,
                as: "surgeryCase",
            },
        });
        return res.status(200).json(swCases);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const getSwCase = async (req, res) => {
    const swCaseId = req.params.swCaseId;
    try {
        const swCase = await SwCase.findByPk(swCaseId, {
            include: {
                model: SurgeryCase,
                as: "surgeryCase",
            },
        });
        return res.status(200).json(swCase);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createSwCase,
    updateSwCase,
    deleteSwCase,
    getSwCases,
    getSwCase,
};