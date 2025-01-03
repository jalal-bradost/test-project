const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ICUData", {
        icuId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        items: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        totalPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        staffs: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        entryTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        exitTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        doctorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    });
}