const db = require("../models");

async function initializeDB() {
    await db.sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await db.sequelize.sync(); 
    console.log("All models were synchronized successfully.");
}

module.exports = {
    initializeDB
}
