const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Role", {
        roleId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        permissions: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: false,
        }
    });
};