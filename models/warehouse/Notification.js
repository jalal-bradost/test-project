// const { DataTypes } = require("sequelize");
//
// module.exports = (sequelize) => {
//     return sequelize.define("Notification", {
//         notificationId: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//             primaryKey: true,
//             autoIncrement: true
//         },
//         title: {
//             type: DataTypes.STRING,
//             allowNull: false,
//         },
//         description: {
//             type: DataTypes.STRING,
//             allowNull: true
//         },
//         userId: {
//             type: DataTypes.INTEGER,
//             allowNull: false
//         },
//         isRead: {
//             type: DataTypes.BOOLEAN,
//             allowNull: false,
//         },
//         type: {
//             type: DataTypes.STRING,
//             defaultValue: "info",
//             allowNull: false
//         },
//         href: {
//             type: DataTypes.STRING,
//             allowNull: true
//         }
//     });
// };
