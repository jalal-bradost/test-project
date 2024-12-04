const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PatientPaymentExpense", {
        patientPaymentExpenseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        patientPaymentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    });
}