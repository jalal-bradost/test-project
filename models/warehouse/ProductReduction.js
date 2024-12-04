const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ProductReduction", {
        productReductionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        barcode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expireDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        productionDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        storageId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        note: {
            type: DataTypes.STRING,
            allowNull: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
};
