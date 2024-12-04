const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ProductInvoice", {
        productInvoiceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        barcode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        invoiceNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false
        },
        retailerId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
};
