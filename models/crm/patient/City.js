const {DataTypes} = require("sequelize");

// age, gender, phone number, notes, relation, 
//status (pending), refer by, refer name

module.exports = (sequelize) => {
    return sequelize.define("PatientCRMCity", {
        cityId: {
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

//INSERT INTO "PatientCRMCities" (name) 
// VALUES 
// ('Erbil'),
// ('Sulaymaniyah'),
// ('Duhok'),
// ('Halabja'),
// ('Baghdad'),
// ('Basra'),
// ('Mosul'),
// ('Kirkuk'),
// ('Najaf'),
// ('Karbala'),
// ('Anbar'),
// ('Salahaddin'),
// ('Diyala'),
// ('Wasit'),
// ('Maysan'),
// ('Dhi Qar'),
// ('Babil'),
// ('Al-Qadisiyyah');