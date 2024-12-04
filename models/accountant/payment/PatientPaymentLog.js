const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PatientPaymentLog", {
        patientPaymentLogId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        patientPaymentId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        currencyId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    });
}