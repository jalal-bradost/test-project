const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("MeetingIdea", {
        meetingIdeaId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        meetingId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    });
};