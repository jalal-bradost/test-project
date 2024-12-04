const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("EmployeeTaskNotificationLimit", {
            employeeId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            }
        }
    );
};
