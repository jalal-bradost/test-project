const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ICUVitalData", {
        icuVitalDataId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        icuVitalId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        temperature: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        nibp: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        ibm: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        cvp: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        hr: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        spo2: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        consciousness: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        remarks: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });
}