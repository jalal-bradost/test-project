const {PicuCase, PicuCaseItem, PicuCaseService, PicuCaseTime, Patient} = require("../../models");
const include = [{model: PicuCaseItem, as: "items",}, {model: PicuCaseTime, as: "times"}, {
    model: PicuCaseService, as: "services"
}, {model: Patient, as: "patient"}];
const createPicuCase = async (req, res) => {
    const picuCaseData = req.body;
    try {
        const picuCase = await PicuCase.create(picuCaseData);
        return res.status(201).json(picuCase);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updatePicuCase = async (req, res) => {
    const picuCaseId = req.params.picuCaseId;
    const picuCaseData = req.body;
    try {
        const picuCase = await PicuCase.findByPk(picuCaseId);
        if (!picuCase) {
            return res.status(404).json({error: 'PICU case not found'});
        }
        delete picuCaseData.picuCaseId;
        delete picuCaseData.patientId;
        await picuCase.update(picuCaseData);
        return res.status(204).json({message: 'PICU case updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deletePicuCase = async (req, res) => {
    const picuCaseId = req.params.picuCaseId;
    try {
        const picuCase = await PicuCase.findByPk(picuCaseId, {include: [{model: PicuCaseItem, as: "items"}]});
        if (!picuCase) {
            return res.status(404).json({error: 'PICU case not found'});
        }
        if (picuCase.items.length > 0) {
            return res.status(400).json({error: 'PICU case has items, cannot delete'});
        }
        await picuCase.destroy();
        return res.status(200).json({message: 'PICU case deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPicuCases = async (req, res) => {
    try {
        const picuCases = await PicuCase.findAll({include});
        const sortedPicuCases = picuCases.sort((a, b) => new Date(b.picuCaseId) - new Date(a.picuCaseId));
        const sortedPicuCasesWithTimesAndServices = sortedPicuCases.map((picuCase) => {
            picuCase = picuCase.get({plain: true, clone: true});
            const times = picuCase.times.sort((a, b) => new Date(a.time) - new Date(b.time));
            const services = picuCase.services.sort((a, b) => new Date(a.picuCaseServiceId) - new Date(b.picuCaseServiceId));
            const items = picuCase.items.sort((a, b) => new Date(a.picuCaseItemId) - new Date(b.picuCaseItemId));
            return {...picuCase, times, services, items};
        })
        return res.status(200).json(sortedPicuCasesWithTimesAndServices);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPicuCase = async (req, res) => {
    const picuCaseId = req.params.picuCaseId;
    try {
        const picuCase = (await PicuCase.findByPk(picuCaseId, {include})).get({plain: true, clone: true});
        const times = picuCase.times.sort((a, b) => new Date(a.time) - new Date(b.time));
        const services = picuCase.services.sort((a, b) => new Date(a.picuCaseServiceId) - new Date(b.picuCaseServiceId));
        const items = picuCase.items.sort((a, b) => new Date(a.picuCaseItemId) - new Date(b.picuCaseItemId));
        return res.status(200).json({...picuCase, items, services, times});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createPicuCase, updatePicuCase, deletePicuCase, getPicuCases, getPicuCase,
};