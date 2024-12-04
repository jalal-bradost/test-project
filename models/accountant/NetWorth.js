const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("NetWorth", {
        netWorthId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        salaryId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
}