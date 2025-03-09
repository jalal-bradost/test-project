const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ClinicStage = sequelize.define("ClinicStage", {
    clinicStageId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    compliant: { // Added purpose as per your new field
      type: DataTypes.STRING(500),
      allowNull: true,
    }
  });

  ClinicStage.getPatients = async () => {
    const [results, metadata] = await sequelize.query(
      `SELECT "fullname", "patientId"  FROM "PatientCRMs" where "isActive" ='true'`,
    );
    return results;
  };

  return ClinicStage;
};
