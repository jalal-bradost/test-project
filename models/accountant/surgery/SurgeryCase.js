const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("SurgeryCase", {
        surgeryCaseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        surgeryTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        surgeryPrice: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    });
}