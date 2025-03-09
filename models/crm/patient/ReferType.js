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

// WhatsApp message 
// WhatsApp call
// Messenger call
// Messenger message
// Instagram call 
// Instagram message
// Phone call
// Telegram call
// Telegram message 
// TikTok message
// Story reply