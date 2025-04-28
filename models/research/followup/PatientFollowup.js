const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PatientFollowUp = sequelize.define("PatientFollowUp", {
    patientId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullname: DataTypes.STRING,
    age: DataTypes.INTEGER,
    sex: DataTypes.STRING,
    drName: DataTypes.STRING,
    patientCode: DataTypes.STRING,
    mobile: DataTypes.STRING, 
    // dateOfAdmission: DataTypes.DATE,
    // timeOfAdmission: DataTypes.STRING,
    // dateOfSurgery: DataTypes.DATE,
    dateOfDischarge: DataTypes.DATE,
    // timeOfDischarge: DataTypes.STRING,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isPassed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return PatientFollowUp;
};
