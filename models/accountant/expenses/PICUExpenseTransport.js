const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PICUExpenseProcedure", {
        picuExpenseProcedureId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        picuExpenseId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING
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