const {SurgeryTypePricingTemplate, SurgeryType, EmployeeRole, Employee, SurgeryPricingTemplate} = require("../../../models");

const createSurgeryTypePricingTemplate = async (req, res) => {
    const surgeryTypePricingTemplateData = req.body;
    try {
        const surgeryTypePricingTemplate = await SurgeryTypePricingTemplate.create(surgeryTypePricingTemplateData);
        return res.status(201).json(surgeryTypePricingTemplate);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updateSurgeryTypePricingTemplate = async (req, res) => {
    const surgeryTypePricingTemplateId = req.params.surgeryTypePricingTemplateId;
    const surgeryTypePricingTemplateData = req.body;
    try {
        const surgeryTypePricingTemplate = await SurgeryTypePricingTemplate.findByPk(surgeryTypePricingTemplateId);
        if (!surgeryTypePricingTemplate) {
            return res.status(404).json({error: "Surgery Pricing Template not found"});
        }
        await surgeryTypePricingTemplate.update(surgeryTypePricingTemplateData);
        return res.status(204).json({message: "Surgery Pricing Template updated"});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deleteSurgeryTypePricingTemplate = async (req, res) => {
    const surgeryTypePricingTemplateId = req.params.surgeryTypePricingTemplateId;
    try {
        const surgeryTypePricingTemplate = await SurgeryTypePricingTemplate.findByPk(surgeryTypePricingTemplateId);
        if (!surgeryTypePricingTemplate) {
            return res.status(404).json({error: "Surgery Pricing Template not found"});
        }
        await surgeryTypePricingTemplate.destroy();
        return res.status(200).json({message: "Surgery Pricing Template deleted"});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getSurgeryTypePricingTemplates = async (req, res) => {
    try {
        const surgeryTypePricingTemplates = await SurgeryTypePricingTemplate.findAll({
            include: [{
                model: SurgeryType, as: "surgeryType"
            }, {
                model: EmployeeRole,
                as: "role"
            }]
        });
        return res.status(200).json(surgeryTypePricingTemplates);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

const getSurgeryTypePricingTemplate = async (req, res) => {
    const surgeryTypePricingTemplateId = req.params.surgeryTypePricingTemplateId;
    try {
        const surgeryTypePricingTemplate = await SurgeryTypePricingTemplate.findByPk(surgeryTypePricingTemplateId, {
            include: [{
                model: SurgeryType, as: "surgeryType"
            }, {
                model: Employee, as: "employee"
            }, {
                model: SurgeryPricingTemplate,
                as: "pricing",
            }
            ]
        });
        return res.status(200).json(surgeryTypePricingTemplate);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createSurgeryTypePricingTemplate,
    updateSurgeryTypePricingTemplate,
    deleteSurgeryTypePricingTemplate,
    getSurgeryTypePricingTemplates,
    getSurgeryTypePricingTemplate,
};