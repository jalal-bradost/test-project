const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("TaskChat", {
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
        taskId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
};