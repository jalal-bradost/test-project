const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ProductStorage", {
        productStorageId: {
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
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        storageId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
};
