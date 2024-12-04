const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Order", {
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        note: {
            type: DataTypes.STRING(500),
            allowNull: true,
        }
    });
}