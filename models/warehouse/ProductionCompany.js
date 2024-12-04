const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ProductionCompany", {
        productionCompanyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        systemCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    });
};
