const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("EmployeeFeedback", {
            feedbackId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            employeeId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            reason: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            typeId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
        }
    );
};
