const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FollowUpStage = sequelize.define("FollowUpStage", {
    followUpId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stageNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    followUpDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    called: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    calledDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return FollowUpStage;
};
