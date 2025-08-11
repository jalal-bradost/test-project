const { CardiologyCase, SurgeryCase, IcuCase, IcuCaseItem, CardiologyCaseItem} = require("../../models");

const createCardiologyCase = async (req, res) => {
    const cardiologyCaseData = req.body;
    try {
        const cardiologyCase = await CardiologyCase.create(cardiologyCaseData);
        return res.status(201).json(cardiologyCase);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const updateCardiologyCase = async (req, res) => {
    const cardiologyCaseId = req.params.cardiologyCaseId;
    const cardiologyCaseData = req.body;
    try {
        const cardiologyCase = await CardiologyCase.findByPk(cardiologyCaseId);
        if (!cardiologyCase) {
            return res.status(404).json({ error: 'Cardiology case not found' });
        }
        delete cardiologyCaseData.cardiologyCaseId;
        delete cardiologyCaseData.surgeryCaseId;
        await cardiologyCase.update(cardiologyCaseData);
        return res.status(204).json({ message: 'Cardiology case updated' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const deleteCardiologyCase = async (req, res) => {
    const cardiologyCaseId = req.params.cardiologyCaseId;
    try {
        const cardiologyCase = await CardiologyCase.findByPk(cardiologyCaseId, {include: [{model: SwCaseItem, as: "items"}]});
        if (!cardiologyCase) {
            return res.status(404).json({error: 'Cardiology case not found'});
        }
        if (cardiologyCase.items.length > 0) {
            return res.status(400).json({error: 'Cardiology case have items, cannot be deleted'});
        }
        await cardiologyCase.destroy();
        return res.status(200).json({ message: 'Cardiology case deleted' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const getCardiologyCases = async (req, res) => {
    try {
        const cardiologyCases = await CardiologyCase.findAll({
            include: {
                model: SurgeryCase,
                as: "surgeryCase",
            },
        });
        return res.status(200).json(cardiologyCases);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const getCardiologyCase = async (req, res) => {
    const cardiologyCaseId = req.params.cardiologyCaseId;
    try {
        const cardiologyCase = await CardiologyCase.findByPk(cardiologyCaseId, {
            include: {
                model: SurgeryCase,
                as: "surgeryCase",
            },
        });
        return res.status(200).json(cardiologyCase);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createCardiologyCase,
    updateCardiologyCase,
    deleteCardiologyCase,
    getCardiologyCases,
    getCardiologyCase,
};