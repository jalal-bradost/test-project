const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Customer", {
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true
        },
        note: {
            type: DataTypes.STRING,
            allowNull: true
        },
        debtThreshold: {
            type: DataTypes.FLOAT,
            allowNull: false,
        }
    });
};
