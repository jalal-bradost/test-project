const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FirstStage = sequelize.define("FirstStage", {
    firstStageId:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    note:{
      type: DataTypes.STRING(255),
      allowNull: true
    },
    faq: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    city:{
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    address:{
      type: DataTypes.STRING(255),
      allowNull: true
    },
    referType:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
    referBy:{
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isDocumentSent: { // Added isVideoSent as per your new field
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    purpose:{
      type: DataTypes.STRING(255),
      allowNull: true
    },
    compliant:{
      type: DataTypes.STRING(255),
      allowNull: true
    },
  }); 
  return FirstStage;
};