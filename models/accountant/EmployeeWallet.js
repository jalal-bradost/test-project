const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("EmployeeWallet", {
            employeeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            balanceUSD: {
                type: DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0
            },
            balanceIQD: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
        }
    );
}