const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Meeting", {
        meetingId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        type: {
            type: DataTypes.ENUM('Online', 'In-Person'),
            allowNull: false,
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        hostId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('Scheduled', 'In Progress', 'Ended'),
            allowNull: false,
            defaultValue: 'Scheduled',
        },
        conclusion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    });
};