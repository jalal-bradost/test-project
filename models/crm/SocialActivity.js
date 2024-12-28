const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SocialActivity = sequelize.define("SocialActivity", {
    socialActivityId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    calledType: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    timeSpent: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    calledDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    faq: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    numberOfPatients:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    createdBy:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    updatedBy:{
        type: DataTypes.INTEGER,
        allowNull: true,
    }
  });

  SocialActivity.getPatients = async () => {
    const [results, metadata] = await sequelize.query(
      `SELECT "fullname", "patientId"  FROM "PatientCRMs"`,
    );
    return results;
  };

  return SocialActivity;
};
