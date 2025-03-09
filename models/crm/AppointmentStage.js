const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AppointmentStage = sequelize.define("AppointmentStage", {
    appointmentStageId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    appointmentDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    calledDateTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    faq: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    reasonWhy: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    compliant: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    purpose: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  });

  AppointmentStage.getPatients = async () => {
    const [results, metadata] = await sequelize.query(
      `SELECT "fullname", "patientId"  FROM "PatientCRMs"`,
    );
    return results;
  };

  return AppointmentStage;
};
