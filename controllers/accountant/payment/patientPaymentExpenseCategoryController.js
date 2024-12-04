const {PatientPaymentExpenseCategory} = require("../../../models");

const createPatientPaymentExpenseCategory = async (req, res) => {
    const patientPaymentExpenseCategoryData = req.body;
    try {
        const patientPaymentExpenseCategory = await PatientPaymentExpenseCategory.create(patientPaymentExpenseCategoryData);
        return res.status(201).json(patientPaymentExpenseCategory);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updatePatientPaymentExpenseCategory = async (req, res) => {
    const patientPaymentExpenseCategoryData = req.body;
    const categoryId = req.params.categoryId;
    try {
        const patientPaymentExpenseCategory = await PatientPaymentExpenseCategory.update(patientPaymentExpenseCategoryData, {where: {categoryId}});
        return res.status(201).json({message: 'Patient Payment Expense Categiory updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};


const deletePatientPaymentExpenseCategory = async (req, res) => {
    const categoryId = req.params.categoryId;
    try {
        const patientPaymentExpenseCategory = await PatientPaymentExpenseCategory.findByPk(categoryId);
        if (!patientPaymentExpenseCategory) {
            return res.status(404).json({error: 'Patient Payment Expense not found'});
        }
        await patientPaymentExpenseCategory.destroy();
        return res.status(200).json({message: 'Patient Payment Expense deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPatientPaymentExpenseCategorys = async (req, res) => {
    try {
        const patientPaymentExpenseCategorys = await PatientPaymentExpenseCategory.findAll();
        return res.status(200).json(patientPaymentExpenseCategorys);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

const getPatientPaymentExpenseCategory = async (req, res) => {
    const categoryId = req.params.categoryId;
    try {
        const patientPaymentExpenseCategory = await PatientPaymentExpenseCategory.findByPk(categoryId);
        return res.status(200).json(patientPaymentExpenseCategory);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createPatientPaymentExpenseCategory,
    deletePatientPaymentExpenseCategory,
    getPatientPaymentExpenseCategorys,
    updatePatientPaymentExpenseCategory,
    getPatientPaymentExpenseCategory,
};