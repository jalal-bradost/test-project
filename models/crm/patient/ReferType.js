const {DataTypes} = require("sequelize");

// age, gender, phone number, notes, relation, 
//status (pending), refer by, refer name

module.exports = (sequelize) => {
    return sequelize.define("PatientCRMReferType", {
        referTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        }, 
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        }
    });
}