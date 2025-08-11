const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Purpose = sequelize.define("Purpose", {
    purposeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    text: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  }, {
    tableName: "Purposes"
  });

  return Purpose;
};
