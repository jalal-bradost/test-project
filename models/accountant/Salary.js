const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Salary", {
        salaryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        baseSalary: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        bonus: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        note: {
            type: DataTypes.STRING,
            allowNull: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    });
}