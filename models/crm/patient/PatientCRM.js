const {DataTypes} = require("sequelize");

// age, gender, phone number, notes, relation, 
//status (pending), refer by, refer name

module.exports = (sequelize) => {
    return sequelize.define("PatientCRM", {
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        }, 
        fullname: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        phoneNumber: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        phoneNumber2: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        birthdate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        sex: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        height: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        weight: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        bloodType: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        note:{
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        isActive:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        }
        
    });
}