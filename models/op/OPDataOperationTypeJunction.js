const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("OPDataOperationTypeJunction", {
        opId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        opOperationTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });
}
