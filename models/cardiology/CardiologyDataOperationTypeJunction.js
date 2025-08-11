const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("CardiologyDataOperationTypeJunction", {
        cardiologyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cardiologyOperationTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });
}
