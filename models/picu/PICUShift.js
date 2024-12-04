const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PICUShift", {
        shiftId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        entryTime: {
            type: DataTypes.STRING,
            allowNull: false
        },
        exitTime: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
}
