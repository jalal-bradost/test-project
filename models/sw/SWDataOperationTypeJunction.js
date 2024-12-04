const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("SWDataOperationTypeJunction", {
        swId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        swOperationTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });
}
