const {body, param} = require("express-validator");
const {SurgeryPricingTemplate, SurgeryType, Currency, FeeType, Role, EmployeeRole} = require("../../models");

const surgeryPricingTemplateCreationValidationRules = () => {
    return [
        body("name").notEmpty().isString(),
        body("surgeryTypeId")
            .notEmpty()
            .isInt()
            .custom(async (surgeryTypeId) => {
                const surgeryType = await SurgeryType.findByPk(surgeryTypeId);
                if (!surgeryType) {
                    throw new Error("Surgery Type not found");
                }
            }),
        body("currencyId")
            .notEmpty()
            .isInt()
            .isInt({min: 0, max: 1}),
        body("feeTypeId")
            .notEmpty()
            .isInt({min: 0, max: 1}),
        body("fee").notEmpty().isFloat(),
        body("roleId")
            .notEmpty()
            .isInt()
            .custom(async (roleId) => {
                const role = await EmployeeRole.findByPk(roleId);
                if (!role) {
                    throw new Error("Role not found");
                }
            }),
    ];
};

const surgeryPricingTemplateUpdateValidationRules = () => {
    return [
        body("name").optional().isString(),
        body("surgeryTypeId")
            .optional()
            .isInt()
            .custom(async (surgeryTypeId) => {
                if (surgeryTypeId) {
                    const surgeryType = await SurgeryType.findByPk(surgeryTypeId);
                    if (!surgeryType) {
                        throw new Error("Surgery Type not found");
                    }
                }
            }),
        body("currencyId")
            .optional()
            .isInt({min: 0, max: 1}),
        body("feeTypeId")
            .optional()
            .isInt({min: 0, max: 1}),
        body("fee").optional().isFloat(),
        body("roleId")
            .optional()
            .isInt()
            .custom(async (roleId) => {
                if (roleId) {
                    const role = await EmployeeRole.findByPk(roleId);
                    if (!role) {
                        throw new Error("Role not found");
                    }
                }
            }),
        surgeryPricingTemplateIdValidation,
    ];
};

const surgeryPricingTemplateDeletionValidationRules = () => {
    return [surgeryPricingTemplateIdValidation];
};

const surgeryPricingTemplateIdValidation = param("surgeryPricingTemplateId")
    .notEmpty()
    .isInt()
    .custom(async (surgeryPricingTemplateId) => {
        const surgeryPricingTemplate = await SurgeryPricingTemplate.findByPk(surgeryPricingTemplateId);
        if (!surgeryPricingTemplate) {
            throw new Error("Surgery Pricing Template not found");
        }
    })
    .bail();

module.exports = {
    surgeryPricingTemplateCreationValidationRules,
    surgeryPricingTemplateUpdateValidationRules,
    surgeryPricingTemplateDeletionValidationRules,
    surgeryPricingTemplateIdValidation,
};