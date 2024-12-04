const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("DepartmentLeader", {
        departmentLeaderId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    });
};
