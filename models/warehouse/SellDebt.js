const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("SellDebt", {
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
        sellId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Sells',
                key: 'sellId'
            }
        }
    });
};
