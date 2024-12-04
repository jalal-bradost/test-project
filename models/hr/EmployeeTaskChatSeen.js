const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("EmployeeTaskChatSeen", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        chatId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'TaskChats',
                key: 'chatId'
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'userId'
            }
        }
    });
};