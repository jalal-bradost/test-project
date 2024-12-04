const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PICURadiology", {
        picuRadiologyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
    });
}