const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Invoice", {
        invoiceId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        discount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        receiver: {
            type: DataTypes.STRING,
            allowNull: false
        },
        note: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
};
