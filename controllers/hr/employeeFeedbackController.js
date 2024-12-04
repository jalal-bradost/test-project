const {EmployeeFeedback, Employee, User} = require("../../models");

const createEmployeeFeedback = async (req, res) => {
    const {typeId, reason, employeeId} = req.body;
    try {
        const employeeFeedback = await EmployeeFeedback.create({typeId, reason, employeeId});
        return res.status(201).json(employeeFeedback);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updateEmployeeFeedback = async (req, res) => {
    const feedbackId = req.params.feedbackId;
    const {reason, typeId} = req.body;
    try {
        const employeeFeedback = await EmployeeFeedback.findByPk(feedbackId);
        if (!employeeFeedback) {
            return res.status(404).json({error: 'Employee feedback not found'});
        }
        await employeeFeedback.update({reason, typeId});
        return res.status(204).json({message: 'Employee feedback updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deleteEmployeeFeedback = async (req, res) => {
    const feedbackId = req.params.feedbackId;
    try {
        const employeeFeedback = await EmployeeFeedback.findByPk(feedbackId);
        if (!employeeFeedback) {
            return res.status(404).json({error: 'Employee feedback not found'});
        }
        await employeeFeedback.destroy();
        return res.status(200).json({message: 'Employee feedback deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createEmployeeFeedback,
    updateEmployeeFeedback,
    deleteEmployeeFeedback

};