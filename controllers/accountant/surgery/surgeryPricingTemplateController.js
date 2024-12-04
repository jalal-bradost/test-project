const {SurgeryPricingTemplate, SurgeryType, EmployeeRole} = require("../../../models");

const createSurgeryPricingTemplate = async (req, res) => {
    const surgeryPricingTemplateData = req.body;
    try {
        const surgeryPricingTemplate = await SurgeryPricingTemplate.create(surgeryPricingTemplateData);
        return res.status(201).json(surgeryPricingTemplate);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updateSurgeryPricingTemplate = async (req, res) => {
    const surgeryPricingTemplateId = req.params.surgeryPricingTemplateId;
    const surgeryPricingTemplateData = req.body;
    try {
        const surgeryPricingTemplate = await SurgeryPricingTemplate.findByPk(surgeryPricingTemplateId);
        if (!surgeryPricingTemplate) {
            return res.status(404).json({error: "Surgery Pricing Template not found"});
        }
        await surgeryPricingTemplate.update(surgeryPricingTemplateData);
        return res.status(204).json({message: "Surgery Pricing Template updated"});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deleteSurgeryPricingTemplate = async (req, res) => {
    const surgeryPricingTemplateId = req.params.surgeryPricingTemplateId;
    try {
        const surgeryPricingTemplate = await SurgeryPricingTemplate.findByPk(surgeryPricingTemplateId);
        if (!surgeryPricingTemplate) {
            return res.status(404).json({error: "Surgery Pricing Template not found"});
        }
        await surgeryPricingTemplate.destroy();
        return res.status(200).json({message: "Surgery Pricing Template deleted"});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getSurgeryPricingTemplates = async (req, res) => {
    try {
        const surgeryPricingTemplates = await SurgeryPricingTemplate.findAll({
            include: [{
                model: SurgeryType, as: "surgeryType"
            }, {
                model: EmployeeRole,
                as: "role"
            }]
        });
        return res.status(200).json(surgeryPricingTemplates);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

const getSurgeryPricingTemplate = async (req, res) => {
    const surgeryPricingTemplateId = req.params.surgeryPricingTemplateId;
    try {
        const surgeryPricingTemplate = await SurgeryPricingTemplate.findByPk(surgeryPricingTemplateId, {
            include: [{
                model: SurgeryType, as: "surgeryType"
            }, {
                model: EmployeeRole, as: "role"
            }]
        });
        return res.status(200).json(surgeryPricingTemplate);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createSurgeryPricingTemplate,
    updateSurgeryPricingTemplate,
    deleteSurgeryPricingTemplate,
    getSurgeryPricingTemplates,
    getSurgeryPricingTemplate,
};