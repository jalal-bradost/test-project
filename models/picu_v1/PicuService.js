const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PicuService", {
        picuServiceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    });
}