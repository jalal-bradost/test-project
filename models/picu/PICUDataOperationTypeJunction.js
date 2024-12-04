const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PICUDataOperationTypeJunction", {
        picuId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'PICUData',
                key: 'picuId'
            }
        },
        picuOperationTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'PICUOperationType',
                key: 'picuOperationTypeId'
            }
        },
    });
}
