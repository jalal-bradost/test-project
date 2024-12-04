const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PICUExpenseConsultation", {
        picuExpenseConsultationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        picuExpenseId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        picuSpecialtyId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        consultantName: {
            type: DataTypes.STRING,
        },
        amountUSD: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        amountIQD: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        paid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
}