const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define("Employee", {
            employeeId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            middleName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            address: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            nationality: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            bloodType: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            phoneNumber: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            dateOfBirth: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            roleId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            departmentId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            salary: {
                type: DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0,
            },
            bonus: {
                type: DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0,
            },
            nationalCardImage: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            infoCardImage: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            agreementCopyImage: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        }, {
            hooks: {
                // afterCreate(attributes, options) {
                //     EmployeeWallet.create({
                //         employeeId: attributes.employeeId,
                //         balanceUSD: 0,
                //         balanceIQD: 0
                //     })
                // }
            }
        }
    );
};
