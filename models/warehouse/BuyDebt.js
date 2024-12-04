const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("BuyDebt", {
        debtId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        paidAmount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        buyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Buys',
                key: 'buyId'
            }
        }
    });
};
