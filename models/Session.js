const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Session", {
        token: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    });
}
;
