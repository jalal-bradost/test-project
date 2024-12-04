const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("SafeLog", {
        safeLogId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        safeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        amountUSD: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        amountIQD: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
    });
}