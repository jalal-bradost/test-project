const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ICUMedicationData", {
        icuMedicationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        icuId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    });
}
;
