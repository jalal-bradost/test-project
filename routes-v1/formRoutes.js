const router = require("../config/express");
const {notifyFormSubmission, notifyAppointmentSubmission} = require("../services/smsService");

router.post(
    '/v1/forms', (req, res) => {
        const {name, phone, issue} = req.body;
        if (!name || !phone || !issue) {
            return res.status(400).json({error: 'All fields are required'});
        }
        notifyFormSubmission(name, phone, issue);
        return res.status(200).json({message: 'Form submitted successfully'});
    });

router.post(
    '/v1/appointments', (req, res) => {
        const {name, phone, date, referral} = req.body;
        if (!name || !phone || !date) {
            return res.status(400).json({error: 'All fields are required'});
        }
        notifyAppointmentSubmission(name, phone, date, referral || "_");
        return res.status(200).json({message: 'Form submitted successfully'});
    });