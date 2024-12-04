const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("SurgeryPricingTemplate", {
        surgeryPricingTemplateId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        surgeryTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        currencyId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        feeTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fee: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        roleId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });
}