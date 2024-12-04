const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Safe", {
        safeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        percentage: {
            type: DataTypes.FLOAT,
            allowNull: false,
            min: 0,
            max: 1
        },
        balanceUSD: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        balanceIQD: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    });
}