const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("OrderChat", {
        chatId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        content: {
            type: DataTypes.STRING(2048),
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });
};