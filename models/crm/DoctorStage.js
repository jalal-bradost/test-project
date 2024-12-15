const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DoctorStage = sequelize.define("DoctorStage", {
    doctorStageId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    calledType: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    duration: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    calledDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    satisfied: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vip: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vipReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    doctorNote: { // Added doctorNote as per your new field
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    faq: { // Added doctorNote as per your new field
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isVideoSent: { // Added isVideoSent as per your new field
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    purpose: { // Added purpose as per your new field
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    interactionCount:{
      type:DataTypes.INTEGER,
      allowNull: true,
    } 
  });

  return DoctorStage;
};
