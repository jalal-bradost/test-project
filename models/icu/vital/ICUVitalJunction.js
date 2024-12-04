const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ICUVital", {
        icuVitalId: {
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
