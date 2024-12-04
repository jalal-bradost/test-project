const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("DepartmentOrderLog", {
        orderLogId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
}