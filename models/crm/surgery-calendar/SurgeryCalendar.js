const {DataTypes} = require("sequelize");

// age, gender, phone number, notes, relation, 
//status (pending), refer by, refer name

module.exports = (sequelize) => {
    const SurgeryCalendar = 
     sequelize.define("SurgeryCalendar", {
        surgeryCalendarId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        }, 
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        note:{
            type: DataTypes.STRING(255),
            allowNull: true,
        }
        
    });
    SurgeryCalendar.getPatients = async () => {
        const [results, metadata] = await sequelize.query(
          `SELECT "fullname", "patientId"  FROM "PatientCRMs" where "isActive" ='true'`,
        );
        return results;
      };

    return SurgeryCalendar;
}