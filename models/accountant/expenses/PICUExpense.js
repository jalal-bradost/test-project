const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PICUExpense", {
        picuExpenseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        childrenPatientPaymentId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
}