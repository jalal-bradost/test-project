const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ICUMedicationData", {
        icuMedicationDataId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        icuMedicationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        day: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        medication: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        floute: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        dosage: {
            type: DataTypes.STRING,
            allowNull: true
        },
        frequency: {
            type: DataTypes.ARRAY(DataTypes.BOOLEAN),
        },
        note: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });
}
;
