const {PatientPaymentExpense, sequelize} = require("../../../models");

const createPatientPaymentExpense = async (req, res) => {
    const patientPaymentExpenseData = req.body;
    try {
        const patientPaymentExpense = await PatientPaymentExpense.create(patientPaymentExpenseData);
        return res.status(201).json(patientPaymentExpense);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updatePatientPaymentExpense = async (req, res) => {
    const patientPaymentExpenseData = req.body;
    try {
        delete patientPaymentExpenseData.patientPaymentExpenseId;
        delete patientPaymentExpenseData.patientPaymentId;
        req.patientPaymentExpense.update(patientPaymentExpenseData);
        return res.status(201).json(patientPaymentExpenseData);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const createBatchPatientPaymentExpense = async (req, res) => {
    const patientPaymentExpenseData = req.body;
    const transaction = await sequelize.transaction();
    try {
        for (const patientPaymentExpense of patientPaymentExpenseData) {
            await PatientPaymentExpense.create(patientPaymentExpense, {transaction});
        }
        await transaction.commit();
        return res.status(201).json({message: 'Patient Payment Expenses created'});
    } catch (error) {
        await transaction.rollback();
        return res.status(400).json({error: error.message});
    }
};


const deletePatientPaymentExpense = async (req, res) => {
    const patientPaymentExpenseId = req.params.patientPaymentExpenseId;
    try {
        const patientPaymentExpense = await PatientPaymentExpense.findByPk(patientPaymentExpenseId);
        if (!patientPaymentExpense) {
            return res.status(404).json({error: 'Patient Payment Expense not found'});
        }
        await patientPaymentExpense.destroy();
        return res.status(200).json({message: 'Patient Payment Expense deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPatientPaymentExpenses = async (req, res) => {
    try {
        const patientPaymentExpenses = await PatientPaymentExpense.findAll();
        return res.status(200).json(patientPaymentExpenses);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

const getPatientPaymentExpense = async (req, res) => {
    const patientPaymentExpenseId = req.params.patientPaymentExpenseId;
    try {
        const patientPaymentExpense = await PatientPaymentExpense.findByPk(patientPaymentExpenseId);
        return res.status(200).json(patientPaymentExpense);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createPatientPaymentExpense,
    deletePatientPaymentExpense,
    getPatientPaymentExpenses,
    createBatchPatientPaymentExpense,
    getPatientPaymentExpense,
    updatePatientPaymentExpense
};