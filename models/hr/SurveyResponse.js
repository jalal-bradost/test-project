const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("SurveyResponse", {
        surveyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        responses: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: [],
        },
    });
};
