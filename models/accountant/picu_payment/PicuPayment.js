const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PicuPayment", {
        picuPaymentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        picuCaseId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        insurance: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        times: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: []
        },
        services: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: []
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