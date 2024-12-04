const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Product", {
        barcode: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        size: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        threshold: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        icuThreshold: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        swThreshold: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        opThreshold: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        perfusionThreshold: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        scrubNurseThreshold: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        anesthesiaThreshold: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        scrubNurseMinimum: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        anesthesiaMinimum: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        picuThreshold: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        icuMinimum: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        swMinimum: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        opMinimum: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        perfusionMinimum: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        picuMinimum: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        perBox: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        expireThreshold: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        boxPriceIQD: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        boxPriceUSD: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        specialPriceIQD: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        specialPriceUSD: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        productionCompanyId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        systemCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        productType: {
            type: DataTypes.ENUM('patient_use', 'staff_use'),
            allowNull: false,
            defaultValue: 'patient_use'
        },
    });
};
