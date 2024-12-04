const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("EmployeeTaskNotificationLog", {
            logId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            taskId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }
    );
};
