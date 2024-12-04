const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PICUExpenseLab", {
        picuExpenseLabId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        picuExpenseId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        picuLabId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        amountUSD: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        amountIQD: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        paid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
}