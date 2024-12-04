const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("ICUDataOperationTypeJunction", {
        icuId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'ICUData',
                key: 'icuId'
            }
        },
        icuOperationTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'ICUOperationType',
                key: 'icuOperationTypeId'
            }
        },
    });
}
