const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ActivityLog = sequelize.define("CrmActivityLog", {
    activityLogId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    stage: { // In which stage the activity was logged
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    objectType: { 
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    objectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    patientId:{
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    note: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    createdBy:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  ActivityLog.getPatients = async () => {
    const [results, metadata] = await sequelize.query(
      `SELECT "fullname", "patientId"  FROM "PatientCRMs" where "isActive" ='true'`,
    );
    return results;
  };

  return ActivityLog;
};
