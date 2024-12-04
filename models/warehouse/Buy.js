const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Buy", {
        buyId: {
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
        salesperson: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        retailerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        invoiceNumber: {
            type: DataTypes.STRING,
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
        },
        systemCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    });
};
