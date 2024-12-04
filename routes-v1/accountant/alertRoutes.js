const router = require("../../config/express");
const {notifyKakGoran} = require("../../services/smsService");
const isAuthenticated = require("../../middlware/isAuthenticatedMiddleware");
const departmentDict = {
    icu: "ICU",
    sw: "Surgical Ward",
    op: "Surgery"
}
router.post(
    '/v1/:department/alert-accountant', isAuthenticated, (req, res) => {
        const {content} = req.body;
        const department = req.params.department;
        if (!content) {
            return res.status(400).json({error: 'All fields are required'});
        }
        notifyKakGoran(departmentDict[department] || "Unknown", content);
        return res.status(200).json({message: 'Form submitted successfully'});
    });