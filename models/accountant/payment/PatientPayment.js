const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PatientPayment", {
        patientPaymentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        insurance: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        icuId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        swId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        opId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        perfusionCaseId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        anesthesiaCaseId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        scrubNurseCaseId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        surgeryCaseId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        swRoomNumber: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        totalPaidIQD: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        totalPaidUSD: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        isClosed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    });
}