const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("CardiologyOperationType", {
        cardiologyOperationTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        paymentThreshold: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
            allowNull: false
        }
    });
}