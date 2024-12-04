const {IcuCase, SurgeryCase, IcuCaseItem} = require("../../models");

const createIcuCase = async (req, res) => {
    const icuCaseData = req.body;
    try {
        const icuCase = await IcuCase.create(icuCaseData);
        return res.status(201).json(icuCase);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updateIcuCase = async (req, res) => {
    const icuCaseId = req.params.icuCaseId;
    const icuCaseData = req.body;
    try {
        const icuCase = await IcuCase.findByPk(icuCaseId);
        if (!icuCase) {
            return res.status(404).json({error: 'ICU case not found'});
        }
        delete icuCaseData.icuCaseId;
        delete icuCaseData.surgeryCaseId;
        await icuCase.update(icuCaseData);
        return res.status(204).json({message: 'ICU case updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deleteIcuCase = async (req, res) => {
    const icuCaseId = req.params.icuCaseId;
    try {
        const icuCase = await IcuCase.findByPk(icuCaseId, {include: [{model: IcuCaseItem, as: "items"}]});
        if (!icuCase) {
            return res.status(404).json({error: 'ICU case not found'});
        }
        if (icuCase.items.length > 0) {
            return res.status(400).json({error: 'ICU case has items, cannot delete'});
        }
        await icuCase.destroy();
        return res.status(200).json({message: 'ICU case deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getIcuCases = async (req, res) => {
    try {
        const icuCases = await IcuCase.findAll({
            include: {
                model: SurgeryCase,
                as: "surgeryCase",
            },
        });
        return res.status(200).json(icuCases);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getIcuCase = async (req, res) => {
    const icuCaseId = req.params.icuCaseId;
    try {
        const icuCase = await IcuCase.findByPk(icuCaseId, {
            include: {
                model: SurgeryCase,
                as: "surgeryCase",
            },
        });
        return res.status(200).json(icuCase);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createIcuCase,
    updateIcuCase,
    deleteIcuCase,
    getIcuCases,
    getIcuCase,
};