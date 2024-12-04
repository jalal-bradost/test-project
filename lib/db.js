const db = require("../models");
const {registerUser} = require("../services/registerUser");
const {Role, Product, OPData, SWData, ICUData, Safe} = require("../models");

async function initializeDB() {
    await db.sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await db.sequelize.sync();
    try {
        await Role.upsert({roleId: 1, name: "Super Admin", permissions: [0, 52, 53]})
        await registerUser({
            userId: 1,
            email: "sina@thes.dev",
            password: "sinasrud197",
            avatar: "no-image.png",
            name: "Sina Srud",
            roleId: 1,
        })
        await Safe.upsert({safeId: 1, name: "Main", percentage: 0, balance: 0})
    } catch (e) {
        console.log(e)
    }
    console.log("All models were synchronized successfully.");
}

module.exports = {
    initializeDB
}
