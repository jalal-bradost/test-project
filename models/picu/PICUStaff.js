const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PICUStaff", {
        staffId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        shiftId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    });
}
