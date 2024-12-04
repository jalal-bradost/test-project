const {body, param} = require("express-validator");
const {SurgeryTypePricingTemplate, SurgeryType, Currency, FeeType, Role, EmployeeRole, SurgeryPricingTemplate} = require("../../models");

const surgeryTypePricingTemplateCreationValidationRules = () => {
    return [
        body("surgeryTypeId")
            .notEmpty()
            .isInt()
            .custom(async (surgeryTypeId) => {
                const surgeryType = await SurgeryType.findByPk(surgeryTypeId);
                if (!surgeryType) {
                    throw new Error("Surgery Type not found");
                }
            }),
        body("surgeryPricingTemplateId")
            .notEmpty()
            .isInt()
            .custom(async (surgeryTypeId) => {
                const surgeryType = await SurgeryPricingTemplate.findByPk(surgeryTypeId);
                if (!surgeryType) {
                    throw new Error("Surgery Pricing Template not found");
                }
            }),
    ];
};

const surgeryTypePricingTemplateUpdateValidationRules = () => {
    return [
        body("surgeryTypeId")
            .notEmpty()
            .isInt()
            .custom(async (surgeryTypeId) => {
                const surgeryType = await SurgeryType.findByPk(surgeryTypeId);
                if (!surgeryType) {
                    throw new Error("Surgery Type not found");
                }
            }),
        body("surgeryPricingTemplateId")
            .notEmpty()
            .isInt()
            .custom(async (surgeryTypeId) => {
                const surgeryType = await SurgeryPricingTemplate.findByPk(surgeryTypeId);
                if (!surgeryType) {
                    throw new Error("Surgery Pricing Template not found");
                }
            }),
        surgeryTypePricingTemplateIdValidation,
    ];
};

const surgeryTypePricingTemplateDeletionValidationRules = () => {
    return [surgeryTypePricingTemplateIdValidation];
};

const surgeryTypePricingTemplateIdValidation = param("surgeryTypePricingTemplateId")
    .notEmpty()
    .isInt()
    .custom(async (surgeryTypePricingTemplateId) => {
        const surgeryTypePricingTemplate = await SurgeryTypePricingTemplate.findByPk(surgeryTypePricingTemplateId);
        if (!surgeryTypePricingTemplate) {
            throw new Error("Surgery Type Pricing Template not found");
        }
    })
    .bail();

module.exports = {
    surgeryTypePricingTemplateCreationValidationRules,
    surgeryTypePricingTemplateUpdateValidationRules,
    surgeryTypePricingTemplateDeletionValidationRules,
    surgeryTypePricingTemplateIdValidation,
};