const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ChildrenPatientPayment", {
        childrenPatientPaymentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        obcCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        l1Cost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        l2Cost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        nivCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        ivCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        clCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        tpnCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        coolingCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        inoCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        consultationCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        surgeryCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        usCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        xrCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        investigationCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        milkCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        mafCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        consumablesCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        transportCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        uacCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        uvcCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        fclCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        intubationCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        piccLineCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        chestTubeCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        lpCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        consultantVisitCost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        otherCosts: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        totalPaidUSD: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        totalPaidIQD: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        insurance: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        insuranceReturn: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        note: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    });
}