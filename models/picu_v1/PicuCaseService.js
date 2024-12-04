const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PicuCaseService", {
        picuCaseServiceId: {
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
        picuServiceId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });
}