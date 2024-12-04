const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("EmployeeWalletLog", {
        logId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        amountUSD: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        amountIQD: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0

        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    });
}