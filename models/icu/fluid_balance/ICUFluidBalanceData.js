const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ICUFluidBalanceData", {
        icuFluidBalanceDataId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        icuFluidBalanceId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        ivFluid: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        support: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        feeding: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        blood: {
            type: DataTypes.STRING,
            allowNull: true
        },
        totalIn: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        totalOut: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        drains: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true
        },
        urineHourly: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        urineTotal: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        ng: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        stool: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    });
}