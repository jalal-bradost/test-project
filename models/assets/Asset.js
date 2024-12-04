const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Asset", {
        assetId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        assetParentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        custodian: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        customId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        note: {
            type: DataTypes.STRING(500),
            allowNull: true,
        }
    });
}