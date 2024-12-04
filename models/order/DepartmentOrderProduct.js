const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("DepartmentOrderProduct", {
        orderProductId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        barcode: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        size: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        note: {
            type: DataTypes.STRING(500),
            allowNull: true,
        }
    });
}