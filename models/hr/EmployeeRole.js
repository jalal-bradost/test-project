const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("EmployeeRole", {
        roleId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });
};
