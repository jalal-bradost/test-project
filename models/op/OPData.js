const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("OPData", {
        opId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        scrubNurseItems: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        perfusionItems: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        anesthesiaItems: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        totalPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        totalPriceScrubNurse: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        totalPriceAnesthesia: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        totalPricePerfusion: {
            type: DataTypes.FLOAT,
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
        isBypass: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
    });
}