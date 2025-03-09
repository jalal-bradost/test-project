const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("SocialActivityDocuments", {
        documentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        }, 
        description: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        documentImgUrl: {
            type: DataTypes.STRING(255),
            allowNull: false,
        }
    });
}

