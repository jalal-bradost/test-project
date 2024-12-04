const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("SurgeryTypePricingTemplate", {
        surgeryTypePricingTemplateId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        surgeryPricingTemplateId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        surgeryTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });
}