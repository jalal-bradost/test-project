const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("OrderProduct", {
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
        code: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        note: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        isArrived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
    });
}