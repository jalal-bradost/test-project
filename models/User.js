const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("User", {
            userId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            roleId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            avatar: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: "no-image.png"
            }
        },
        {
            defaultScope: {
                attributes: {exclude: ['password']}
            },
            scopes: {
                withPassword: {
                    attributes: {include: ['password']},
                },
            },
        });
};
