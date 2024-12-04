const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("MeetingParticipant", {
        meetingParticipantId: {
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
        attended: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        joinTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        leaveTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    });
};