const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("DepartmentOrder", {
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        note: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        reason: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        deadline: {
            type: DataTypes.DATE,
            allowNull: true
        }
    });
}