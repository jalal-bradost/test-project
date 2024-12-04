const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Settings", {
        key: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        value: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    });
};
