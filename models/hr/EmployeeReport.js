const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("EmployeeReport", {
        reportId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        accomplishments: {
            type: DataTypes.STRING(2000),
            allowNull: false
        },
        plans: {
            type: DataTypes.STRING(2000),
            allowNull: false
        },
    });
};