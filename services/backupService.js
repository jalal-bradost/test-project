// // Function to get data from the tables
// const {
//     Product,
//     Category,
//     Storage,
//     ProductStorage,
//     ProductInvoice,
//     Retailer,
//     ProductionCompany,
//     Customer,
//     Buy,
//     BuyDebt,
//     Sell,
//     SellDebt,
//     User,
//     Session,
//     Notification,
//     Settings,
//     ICUOperationType,
//     Patient,
//     ICUShift,
//     ICUStaff,
//     ICUData,
//     SWData,
//     SWOperationType,
//     SWDataOperationTypeJunction,
//     OPOperationType,
//     OPDataOperationTypeJunction,
//     OPData,
//     Transfer,
//     Role,
//     NetWorth,
//     Employee,
//     Salary
// } = require("../models");
//
// const schedule = require("node-schedule")
// const fs = require("fs")
//
// const getData = async () => {
//     try {
//         const products = await Product.findAll();
//         const categories = await Category.findAll();
//         const storages = await Storage.findAll();
//         const productStorages = await ProductStorage.findAll();
//         const productInvoices = await ProductInvoice.findAll();
//         const retailers = await Retailer.findAll();
//         const productionCompanies = await ProductionCompany.findAll();
//         const customers = await Customer.findAll();
//         const buys = await Buy.findAll();
//         const buyDebts = await BuyDebt.findAll();
//         const sells = await Sell.findAll();
//         const sellDebts = await SellDebt.findAll();
//         const users = await User.findAll();
//         const sessions = await Session.findAll();
//         const notifications = await Notification.findAll();
//         const settings = await Settings.findAll();
//         const icuOperationTypes = await ICUOperationType.findAll();
//         const patients = await Patient.findAll();
//         const icuShifts = await ICUShift.findAll();
//         const icuStaff = await ICUStaff.findAll();
//         const icuData = await ICUData.findAll();
//         const swData = await SWData.findAll();
//         const swOperationTypes = await SWOperationType.findAll();
//         const swDataOperationTypeJunctions = await SWDataOperationTypeJunction.findAll();
//         const opOperationTypes = await OPOperationType.findAll();
//         const opDataOperationTypeJunctions = await OPDataOperationTypeJunction.findAll();
//         const opData = await OPData.findAll();
//         const transfers = await Transfer.findAll();
//         const roles = await Role.findAll();
//         const netWorths = await NetWorth.findAll();
//         const employees = await Employee.findAll();
//         const salaries = await Salary.findAll();
//
//         return {
//             products,
//             categories,
//             storages,
//             productStorages,
//             productInvoices,
//             retailers,
//             productionCompanies,
//             customers,
//             buys,
//             buyDebts,
//             sells,
//             sellDebts,
//             users,
//             sessions,
//             notifications,
//             settings,
//             icuOperationTypes,
//             patients,
//             icuShifts,
//             icuStaff,
//             icuData,
//             swData,
//             swOperationTypes,
//             swDataOperationTypeJunctions,
//             opOperationTypes,
//             opDataOperationTypeJunctions,
//             opData,
//             transfers,
//             roles,
//             netWorths,
//             employees,
//             salaries,
//         };
//     } catch (error) {
//         console.error("Error fetching data:", error);
//         return {};
//     }
// };
//
//
// // Function to save data to a json file
// const saveBackup = (data) => {
//     const date = new Date();
//     const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}`;
//     const filePath = `./backup/backup_${formattedDate}.json`;
//     fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
//         if (err) {
//             console.error('Error while saving backup: ', err);
//         } else {
//             console.log(`Backup saved to ${filePath}`);
//         }
//     });
// };
//
// // Schedule the backup every 30 minutes
// schedule.scheduleJob('0 */3 * * *', async () => {
//     const data = await getData();
//     saveBackup(data);
// });
