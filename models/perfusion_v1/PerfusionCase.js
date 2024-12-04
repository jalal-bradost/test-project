const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("PerfusionCase", {
        perfusionCaseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        notes: {
            type: DataTypes.ARRAY(DataTypes.STRING(255)),
            allowNull: false,
            defaultValue: []
        },
        entryTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        exitTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        totalPrice: {
            type: DataTypes.VIRTUAL,
            get() {
                if (!this.items) return 0;
                let total = this.items.reduce((total, item) => {
                    return total + (item.price * item.quantity);
                }, 0);
                return parseFloat(total.toFixed(2));
            }
        }
    });
}