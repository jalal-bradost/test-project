const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Transfer", {
        transferId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        toStorageId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        products: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        systemCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
    });
};
