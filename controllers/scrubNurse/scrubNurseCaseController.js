const {ScrubNurseCase, ScrubNurseCaseItem, Patient} = require("../../models");
const include = [{
    model: ScrubNurseCaseItem, as: "items", attributes: {
        exclude: ['code', 'scrubNurseCaseId', 'updatedAt', 'barcode']
    }
}, {model: Patient, as: "patient"}];
const createScrubNurseCase = async (req, res) => {
    const scrubNurseCaseData = req.body;
    try {
        const scrubNurseCase = await ScrubNurseCase.create(scrubNurseCaseData);
        return res.status(201).json(scrubNurseCase);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updateScrubNurseCase = async (req, res) => {
    const scrubNurseCaseId = req.params.scrubNurseCaseId;
    const scrubNurseCaseData = req.body;
    try {
        const scrubNurseCase = await ScrubNurseCase.findByPk(scrubNurseCaseId);
        if (!scrubNurseCase) {
            return res.status(404).json({error: 'ScrubNurse case not found'});
        }
        delete scrubNurseCaseData.scrubNurseCaseId;
        delete scrubNurseCaseData.patientId;
        await scrubNurseCase.update(scrubNurseCaseData);
        return res.status(204).json({message: 'ScrubNurse case updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deleteScrubNurseCase = async (req, res) => {
    const scrubNurseCaseId = req.params.scrubNurseCaseId;
    try {
        const scrubNurseCase = await ScrubNurseCase.findByPk(scrubNurseCaseId, {
            include: [{
                model: ScrubNurseCaseItem,
                as: "items"
            }]
        });
        if (!scrubNurseCase) {
            return res.status(404).json({error: 'ScrubNurse case not found'});
        }
        if (scrubNurseCase.items.length > 0) {
            return res.status(400).json({error: 'ScrubNurse case has items, cannot delete'});
        }
        await scrubNurseCase.destroy();
        return res.status(200).json({message: 'ScrubNurse case deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getScrubNurseCases = async (req, res) => {
    try {
        const scrubNurseCases = await ScrubNurseCase.findAll({include});
        const sortedScrubNurseCases = scrubNurseCases.sort((a, b) => new Date(b.scrubNurseCaseId) - new Date(a.scrubNurseCaseId));
        const sortedScrubNurseCasesWithTimesAndServices = sortedScrubNurseCases.map((scrubNurseCase) => {
            scrubNurseCase = scrubNurseCase.get({plain: true, clone: true});
            const items = scrubNurseCase.items.sort((a, b) => new Date(a.scrubNurseCaseItemId) - new Date(b.scrubNurseCaseItemId));
            return {...scrubNurseCase, items};
        })
        return res.status(200).json(sortedScrubNurseCasesWithTimesAndServices);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getScrubNurseCase = async (req, res) => {
    const scrubNurseCaseId = req.params.scrubNurseCaseId;
    try {
        const scrubNurseCase = (await ScrubNurseCase.findByPk(scrubNurseCaseId, {include})).get({
            plain: true,
            clone: true
        });
        const items = scrubNurseCase.items.sort((a, b) => new Date(a.scrubNurseCaseItemId) - new Date(b.scrubNurseCaseItemId));
        return res.status(200).json({...scrubNurseCase, items});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createScrubNurseCase, updateScrubNurseCase, deleteScrubNurseCase, getScrubNurseCases, getScrubNurseCase,
};