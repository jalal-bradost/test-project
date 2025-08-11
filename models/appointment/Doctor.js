const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Doctor = sequelize.define("Doctor", {
    doctorId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    level: {
      type: DataTypes.ENUM("junior", "senior", "external"),
      allowNull: false,
    },
    fee: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Will be set in hook
    },
  }, {
    tableName: "Doctors",
    hooks: {
      beforeCreate: (doctor) => {
        if (doctor.level === 'junior') doctor.fee = 0;
        if (doctor.level === 'senior') doctor.fee = 25000;
        if (doctor.level === 'external') doctor.fee = 50000;
      },
      beforeUpdate: (doctor) => {
        if (doctor.level === 'junior') doctor.fee = 0;
        if (doctor.level === 'senior') doctor.fee = 25000;
        if (doctor.level === 'external') doctor.fee = 50000;
      },
    }
  });

  return Doctor;
};
