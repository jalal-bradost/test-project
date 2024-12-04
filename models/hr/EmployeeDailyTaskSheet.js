const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("EmployeeDailyTaskSheet", {
            sheetId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            taskId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            progress: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            description: {
                type: DataTypes.STRING(2000),
                allowNull: true,
            },
            obstacles: {
                type: DataTypes.STRING(2000),
                allowNull: true,
            }
        }
    );
};
