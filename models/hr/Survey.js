const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Survey", {
        surveyId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        deadline: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        elements: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: [],
        },
    });
};
