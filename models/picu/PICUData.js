const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PICUData", {
        picuId: {
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
        notes: {
            type: DataTypes.ARRAY(DataTypes.STRING(255)),
            allowNull: false,
            defaultValue: []
        },
        staffs: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        obcTimes: {
            type: DataTypes.ARRAY(DataTypes.DATE),
            allowNull: false,
            defaultValue: []
        },
        l1Times: {
            type: DataTypes.ARRAY(DataTypes.DATE),
            allowNull: false,
            defaultValue: []
        },
        l2Times: {
            type: DataTypes.ARRAY(DataTypes.DATE),
            allowNull: false,
            defaultValue: []
        },
        nivTimes: {
            type: DataTypes.ARRAY(DataTypes.DATE),
            allowNull: false,
            defaultValue: []
        },
        ivTimes: {
            type: DataTypes.ARRAY(DataTypes.DATE),
            allowNull: false,
            defaultValue: []
        },
        clTimes: {
            type: DataTypes.ARRAY(DataTypes.DATE),
            allowNull: false,
            defaultValue: []
        },
        tpnTimes: {
            type: DataTypes.ARRAY(DataTypes.DATE),
            allowNull: false,
            defaultValue: []
        },
        coolingTimes: {
            type: DataTypes.ARRAY(DataTypes.DATE),
            allowNull: false,
            defaultValue: []
        },
        inoTimes: {
            type: DataTypes.ARRAY(DataTypes.DATE),
            allowNull: false,
            defaultValue: []
        },
        doctorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        consultationAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        usAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        xrAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        investigationAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        milkAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        mafAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        consumablesAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        transportAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        uacAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        uvcAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        fclAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        intubationAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        piccLineAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        chestTubeAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        lpAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        consultantVisitAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
    });
}