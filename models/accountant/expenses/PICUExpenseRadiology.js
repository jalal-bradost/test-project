const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PICUExpenseRadiology", {
        picuExpenseRadiologyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        picuExpenseId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        picuRadiologyId: {
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