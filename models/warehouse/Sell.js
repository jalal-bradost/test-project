const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Sell", {
        sellId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        products: {
            type: DataTypes.ARRAY(DataTypes.JSON),
            allowNull: false,
        },
        totalPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        buyer: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        note: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paymentType: {
            //debt, upfront
            type: DataTypes.STRING,
            allowNull: false,
        }
    });
};
