const {body, param} = require('express-validator');
const {DepartmentOrder} = require("../models");

const orderChatCreationValidationRules = () => {
    return [
        body('content')
            .notEmpty()
            .isString(),
        orderIdValidation
    ];
};

const orderIdValidation = param("orderId")
    .notEmpty()
    .isInt()
    .custom(async orderId => {
        const order = await DepartmentOrder.findByPk(orderId);
        if (!order) {
            throw new Error("Order not found")
        }
    })
    .bail();

const orderAudioChatCreationValidationRules = () => {
    return [
        body('file')
            .notEmpty(),
        orderIdValidation
    ];
};

const orderFileChatCreationValidationRules = () => {
    return [
        body('file')
            .notEmpty(),
        orderIdValidation
    ];
};

module.exports = {
    orderIdValidation,
    orderChatCreationValidationRules,
    orderAudioChatCreationValidationRules,
    orderFileChatCreationValidationRules
};