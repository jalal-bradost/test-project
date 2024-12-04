const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PicuCaseTime", {
        picuCaseTimeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        picuCaseId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        picuTimeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        entryTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        exitTime: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
    });
}