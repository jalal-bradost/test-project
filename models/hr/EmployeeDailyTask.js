const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("EmployeeDailyTask", {
            taskId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            employeeId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            managerCompletionRate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            taskPercentage: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            }
        }
    );
};
