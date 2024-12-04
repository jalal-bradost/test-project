const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("SurgeryPricing", {
        surgeryPricingId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        surgeryCaseId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        currencyId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fee: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        feeTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        isPaid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
}