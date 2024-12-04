const {PerfusionCase, PerfusionCaseItem, Patient} = require("../../models");
const include = [{model: PerfusionCaseItem, as: "items", attributes: {
        exclude: ['code', 'perfusionCaseId', 'updatedAt', 'barcode']
    }}, {model: Patient, as: "patient"}];
const createPerfusionCase = async (req, res) => {
    const perfusionCaseData = req.body;
    try {
        const perfusionCase = await PerfusionCase.create(perfusionCaseData);
        return res.status(201).json(perfusionCase);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updatePerfusionCase = async (req, res) => {
    const perfusionCaseId = req.params.perfusionCaseId;
    const perfusionCaseData = req.body;
    try {
        const perfusionCase = await PerfusionCase.findByPk(perfusionCaseId);
        if (!perfusionCase) {
            return res.status(404).json({error: 'Perfusion case not found'});
        }
        delete perfusionCaseData.perfusionCaseId;
        delete perfusionCaseData.patientId;
        await perfusionCase.update(perfusionCaseData);
        return res.status(204).json({message: 'Perfusion case updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deletePerfusionCase = async (req, res) => {
    const perfusionCaseId = req.params.perfusionCaseId;
    try {
        const perfusionCase = await PerfusionCase.findByPk(perfusionCaseId, {
            include: [{
                model: PerfusionCaseItem,
                as: "items"
            }]
        });
        if (!perfusionCase) {
            return res.status(404).json({error: 'Perfusion case not found'});
        }
        if (perfusionCase.items.length > 0) {
            return res.status(400).json({error: 'Perfusion case has items, cannot delete'});
        }
        await perfusionCase.destroy();
        return res.status(200).json({message: 'Perfusion case deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPerfusionCases = async (req, res) => {
    try {
        const perfusionCases = await PerfusionCase.findAll({include});
        const sortedPerfusionCases = perfusionCases.sort((a, b) => new Date(b.perfusionCaseId) - new Date(a.perfusionCaseId));
        const sortedPerfusionCasesWithTimesAndServices = sortedPerfusionCases.map((perfusionCase) => {
            perfusionCase = perfusionCase.get({plain: true, clone: true});
            const items = perfusionCase.items.sort((a, b) => new Date(a.perfusionCaseItemId) - new Date(b.perfusionCaseItemId));
            return {...perfusionCase, items};
        })
        return res.status(200).json(sortedPerfusionCasesWithTimesAndServices);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPerfusionCase = async (req, res) => {
    const perfusionCaseId = req.params.perfusionCaseId;
    try {
        const perfusionCase = (await PerfusionCase.findByPk(perfusionCaseId, {include})).get({
            plain: true,
            clone: true
        });
        const items = perfusionCase.items.sort((a, b) => new Date(a.perfusionCaseItemId) - new Date(b.perfusionCaseItemId));
        return res.status(200).json({...perfusionCase, items});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createPerfusionCase, updatePerfusionCase, deletePerfusionCase, getPerfusionCases, getPerfusionCase,
};