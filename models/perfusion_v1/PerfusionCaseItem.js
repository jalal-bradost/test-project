const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PerfusionCaseItem", {
        perfusionCaseItemId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        perfusionCaseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        size: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        barcode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    }, {
        defaultScope: {
            attributes: {exclude: ['code', 'perfusionCaseId', 'updatedAt', 'barcode']}
        }
    });
}