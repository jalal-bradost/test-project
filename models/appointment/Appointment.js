const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
 const Appointment = sequelize.define("Appointment", {
  appointmentId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  appointmentDateTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  note: DataTypes.STRING(255),
  faq: DataTypes.STRING(500),
  reasonWhy: DataTypes.STRING(500),
  compliant: DataTypes.STRING(255),
  isAttended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  purposeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});


  return Appointment;
};
