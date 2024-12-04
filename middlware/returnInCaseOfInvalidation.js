const {validationResult} = require("express-validator");
const returnInCaseOfInvalidation = (req, res, next) => {
    const result = validationResult(req)
    if (!result.isEmpty()) {
        return res.status(400).json(result.array())
    }
    return next();
}

module.exports = returnInCaseOfInvalidation