const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("EmployeeTask", {
            taskId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            employeeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            deadline: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            completionDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            employeeCompletionRate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            managerCompletionRate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            priority: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            taskPercentage: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            freezeDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        }
    );
};
