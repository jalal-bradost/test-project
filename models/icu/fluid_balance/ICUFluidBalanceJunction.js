const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ICUFluidBalance", {
        icuFluidBalanceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        icuId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    })
}
