const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("SwCase", {
        swCaseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        surgeryCaseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        entryTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        exitTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    });
}