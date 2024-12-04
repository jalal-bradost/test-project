const { SurgeryType: SurgeryTypeController, SurgeryTypePricingTemplate, SurgeryPricingTemplate} = require("../../../models");

const createSurgeryType = async (req, res) => {
    const { name } = req.body;
    try {
        const surgeryType = await SurgeryTypeController.create({ name });
        return res.status(201).json(surgeryType);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const updateSurgeryType = async (req, res) => {
    const surgeryTypeId = req.params.surgeryTypeId;
    const { name } = req.body;
    try {
        const surgeryType = await SurgeryTypeController.findByPk(surgeryTypeId);
        if (!surgeryType) {
            return res.status(404).json({ error: 'SurgeryTypeController not found' });
        }
        await surgeryType.update({ name });
        return res.status(204).json({ message: 'SurgeryTypeController updated' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const deleteSurgeryType = async (req, res) => {
    const surgeryTypeId = req.params.surgeryTypeId;
    try {
        const surgeryType = await SurgeryTypeController.findByPk(surgeryTypeId);
        if (!surgeryType) {
            return res.status(404).json({ error: 'SurgeryTypeController not found' });
        }
        await surgeryType.destroy();
        return res.status(200).json({ message: 'SurgeryTypeController deleted' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const getSurgeryTypes = async (req, res) => {
    try {
        const surgeryTypes = await SurgeryTypeController.findAll({
            include: [
                {
                    model: SurgeryTypePricingTemplate,
                    as: "pricingTemplates",
                    include: [
                        {
                            model: SurgeryPricingTemplate,
                            as: "pricingTemplate"
                        }
                    ]
                }
            ]
        });
        return res.status(200).json(surgeryTypes);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createSurgeryType,
    updateSurgeryType,
    deleteSurgeryType,
    getSurgeryTypes
};