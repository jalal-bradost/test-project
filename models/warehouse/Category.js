const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Category", {
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        systemCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    });
};
