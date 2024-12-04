const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PicuCase", {
        picuCaseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        notes: {
            type: DataTypes.ARRAY(DataTypes.STRING(255)),
            allowNull: false,
            defaultValue: []
        },
    });
}