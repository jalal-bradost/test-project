const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PatientPaymentExpenseTemplate", {
        patientPaymentExpenseTemplateId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    });
}