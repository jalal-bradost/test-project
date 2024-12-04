const {AnesthesiaCase, AnesthesiaCaseItem, Patient} = require("../../models");
const include = [{
    model: AnesthesiaCaseItem, as: "items"}, {model: Patient, as: "patient"}];
const createAnesthesiaCase = async (req, res) => {
    const anesthesiaCaseData = req.body;
    try {
        const anesthesiaCase = await AnesthesiaCase.create(anesthesiaCaseData);
        return res.status(201).json(anesthesiaCase);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updateAnesthesiaCase = async (req, res) => {
    const anesthesiaCaseId = req.params.anesthesiaCaseId;
    const anesthesiaCaseData = req.body;
    try {
        const anesthesiaCase = await AnesthesiaCase.findByPk(anesthesiaCaseId);
        if (!anesthesiaCase) {
            return res.status(404).json({error: 'Anesthesia case not found'});
        }
        delete anesthesiaCaseData.anesthesiaCaseId;
        delete anesthesiaCaseData.patientId;
        await anesthesiaCase.update(anesthesiaCaseData);
        return res.status(204).json({message: 'Anesthesia case updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deleteAnesthesiaCase = async (req, res) => {
    const anesthesiaCaseId = req.params.anesthesiaCaseId;
    try {
        const anesthesiaCase = await AnesthesiaCase.findByPk(anesthesiaCaseId, {
            include: [{
                model: AnesthesiaCaseItem,
                as: "items"
            }]
        });
        if (!anesthesiaCase) {
            return res.status(404).json({error: 'Anesthesia case not found'});
        }
        if (anesthesiaCase.items.length > 0) {
            return res.status(400).json({error: 'Anesthesia case has items, cannot delete'});
        }
        await anesthesiaCase.destroy();
        return res.status(200).json({message: 'Anesthesia case deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getAnesthesiaCases = async (req, res) => {
    try {
        const anesthesiaCases = await AnesthesiaCase.findAll({include});
        const sortedAnesthesiaCases = anesthesiaCases.sort((a, b) => new Date(b.anesthesiaCaseId) - new Date(a.anesthesiaCaseId));
        const sortedAnesthesiaCasesWithTimesAndServices = sortedAnesthesiaCases.map((anesthesiaCase) => {
            anesthesiaCase = anesthesiaCase.get({plain: true, clone: true});
            const items = anesthesiaCase.items.sort((a, b) => new Date(a.anesthesiaCaseItemId) - new Date(b.anesthesiaCaseItemId));
            return {...anesthesiaCase, items};
        })
        return res.status(200).json(sortedAnesthesiaCasesWithTimesAndServices);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getAnesthesiaCase = async (req, res) => {
    const anesthesiaCaseId = req.params.anesthesiaCaseId;
    try {
        const anesthesiaCase = (await AnesthesiaCase.findByPk(anesthesiaCaseId, {include})).get({
            plain: true,
            clone: true
        });
        const items = anesthesiaCase.items.sort((a, b) => new Date(a.anesthesiaCaseItemId) - new Date(b.anesthesiaCaseItemId));
        return res.status(200).json({...anesthesiaCase, items});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createAnesthesiaCase, updateAnesthesiaCase, deleteAnesthesiaCase, getAnesthesiaCases, getAnesthesiaCase,
};