const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("IcuCase", {
        caseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        surgeryCaseId: {
            type: DataTypes.INTEGER,
            allowNull: true,
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