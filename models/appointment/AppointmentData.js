const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("AppointmentData", {
        appointmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        items: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        totalPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    });
}