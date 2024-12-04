const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PatientPaymentExpenseCategory", {
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    });
}