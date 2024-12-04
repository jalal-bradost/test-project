const {PatientPaymentExpenseTemplate, PatientPaymentExpenseCategory} = require("../../../models");

const createPatientPaymentExpenseTemplate = async (req, res) => {
    const patientPaymentExpenseTemplateData = req.body;
    try {
        const patientPaymentExpenseTemplate = await PatientPaymentExpenseTemplate.create(patientPaymentExpenseTemplateData);
        return res.status(201).json(patientPaymentExpenseTemplate);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updatePatientPaymentExpenseTemplate = async (req, res) => {
    const patientPaymentExpenseTemplateId = req.params.patientPaymentExpenseTemplateId;
    const patientPaymentExpenseTemplateData = req.body;
    try {
        const patientPaymentExpenseTemplate = await PatientPaymentExpenseTemplate.findByPk(patientPaymentExpenseTemplateId);
        if (!patientPaymentExpenseTemplate) {
            return res.status(404).json({error: "Patient Payment Expense Template not found"});
        }
        await patientPaymentExpenseTemplate.update(patientPaymentExpenseTemplateData);
        return res.status(204).json({message: "Patient Payment Expense Template updated"});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deletePatientPaymentExpenseTemplate = async (req, res) => {
    const patientPaymentExpenseTemplateId = req.params.patientPaymentExpenseTemplateId;
    try {
        const patientPaymentExpenseTemplate = await PatientPaymentExpenseTemplate.findByPk(patientPaymentExpenseTemplateId);
        if (!patientPaymentExpenseTemplate) {
            return res.status(404).json({error: "Surgery Pricing Template not found"});
        }
        await patientPaymentExpenseTemplate.destroy();
        return res.status(200).json({message: "Surgery Pricing Template deleted"});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPatientPaymentExpenseTemplates = async (req, res) => {
    try {
        const patientPaymentExpenseTemplates = await PatientPaymentExpenseTemplate.findAll({include: [{model: PatientPaymentExpenseCategory, as: "category"}]});
        return res.status(200).json(patientPaymentExpenseTemplates);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

const getPatientPaymentExpenseTemplate = async (req, res) => {
    const patientPaymentExpenseTemplateId = req.params.patientPaymentExpenseTemplateId;
    try {
        const patientPaymentExpenseTemplate = await PatientPaymentExpenseTemplate.findByPk(patientPaymentExpenseTemplateId);
        return res.status(200).json(patientPaymentExpenseTemplate);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createPatientPaymentExpenseTemplate,
    updatePatientPaymentExpenseTemplate,
    deletePatientPaymentExpenseTemplate,
    getPatientPaymentExpenseTemplates,
    getPatientPaymentExpenseTemplate,
};