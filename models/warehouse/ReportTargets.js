const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ReportTargets", {
        reportId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        period: {
            type: DataTypes.BIGINT,
            allowNull: false
        }
    });
};
