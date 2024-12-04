const {body, param} = require("express-validator");

const surveyCreationValidationRules = () => {
    return [
        body("name").isString().withMessage("Name is required").bail(),
        body("elements.*.name").isString().withMessage("form item name is required").bail(),
        body("elements.*.title").isString().withMessage("form item title is required").bail(),
        body("elements.*.description").optional().isString().withMessage("form item title is required").bail(),
        body("elements.*.type").isString().isIn(["text", "checkbox", "dropdown", "Ranking", "rating", "tagbox", "matrix"]).withMessage("form item type is required").bail(),
        body("elements.*.isRequired").isBoolean().withMessage("form item required is required").bail(),
        body("elements.*.condition").isBoolean().withMessage("form item condition is required").bail(),
        body("elements.*.choices").optional().isArray().withMessage("form item choices should be an array").bail(),
    ];
};

const surveyModificationValidationRules = () => {
    return [
        body("name").isString().withMessage("Name is required").bail(),
        body("elements.*.name").isString().withMessage("form item name is required").bail(),
        body("elements.*.title").isString().withMessage("form item title is required").bail(),
        body("elements.*.description").optional().isString().withMessage("form item title is required").bail(),
        body("elements.*.type").isString().isIn(["text", "checkbox", "dropdown", "Ranking", "rating", "tagbox", "matrix"]).withMessage("form item type is required").bail(),
        body("elements.*.isRequired").isBoolean().withMessage("form item required is required").bail(),
        body("elements.*.choices").optional().isArray().withMessage("form item choices should be an array").bail(),
    ];
};
const surveyRetrievalValidationRules = () => {
    return [
        param("surveyId").isInt().withMessage("Survey ID is required").bail(),
    ];
};

module.exports = {
    surveyCreationValidationRules,
    surveyModificationValidationRules,
    surveyRetrievalValidationRules
};