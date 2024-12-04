require('dotenv').config()
const app = require("./config/express")
const {initializeDB} = require("./lib/db")
const {PICUData} = require("./models/index")
const {PicuCase, PicuCaseTime, PicuCaseService, PicuCaseItem, sequelize, Product} = require("./models");
const times = {
    obcTimes: 2,
    l1Times: 3,
    l2Times: 4,
    nivTimes: 5,
    ivTimes: 6,
    clTimes: 7,
    tpnTimes: 8,
    coolingTimes: 9,
    inoTimes: 10
}
const services = {
    consultationAmount: 1,
    usAmount: 3,
    xrAmount: 4,
    investigationAmount: 5,
    milkAmount: 6,
    mafAmount: 7,
    consumablesAmount: 8,
    transportAmount: 9,
    uacAmount: 10,
    uvcAmount: 11,
    fclAmount: 12,
    intubationAmount: 13,
    piccLineAmount: 14,
    chestTubeAmount: 15,
    lpAmount: 16,
    consultantVisitAmount: 17
}
initializeDB().then(async () => {
        console.log("Database initialized")
        const picuDatas = await PICUData.findAll();
        // const picuCaseItems = await PicuCaseItem.findAll();
        const transaction = await sequelize.transaction();
        try {
            // for (const item of picuCaseItems) {
            //     const itemData = item.get({plain: true});
            //     const product = await Product.findByPk(itemData.barcode);
            //     await item.update({price: itemData.price / (product.perBox > 0 ? product.perBox : 1)}, {transaction})
            // }
            for (const picuData of picuDatas) {
                const data = picuData.get({plain: true});
                // console.log(data)
                const newPicuCase = await PicuCase.findOne({
                    where: {notes: data.notes, patientId: data.patientId},
                    transaction,
                    include: [{model: PicuCaseItem, as: "items"}]
                });
                // for (const [key, value] of Object.entries(times)) {
                //     for (let i = 0; i < data[key].length; i += 2) {
                //         const entryTime = data[key][i];
                //         const exitTime = data[key][i + 1];
                //         await PicuCaseTime.create({
                //             picuCaseId: newPicuCase.picuCaseId,
                //             picuTimeId: value,
                //             entryTime,
                //             exitTime
                //         }, {transaction})
                //     }
                // }
                // for (const [key, value] of Object.entries(services)) {
                //     for (let i = 0; i < data[key]; i++) {
                //         await PicuCaseService.create({
                //             picuCaseId: newPicuCase.picuCaseId,
                //             picuServiceId: value
                //         }, {transaction})
                //     }
                // }
                // const oldLength = newPicuCase.items.length;
                // await PicuCaseItem.destroy({where: {picuCaseId: newPicuCase.picuCaseId}, transaction})
                // for (const item of data.items) {
                //     await PicuCaseItem.create({
                //         picuCaseId: newPicuCase.picuCaseId, ...item, ...item.product,
                //         price: item.product.specialPriceUSD / (item.product.perBox > 0 ? item.product.perBox : 1)
                //     }, {transaction})
                //     console.log(newPicuCase.picuCaseId)
                // }
                // compare
                if (newPicuCase.items.length === data.items.length) continue;
                if (newPicuCase.picuCaseId > 21) continue;
                await PicuCaseItem.destroy({where: {picuCaseId: newPicuCase.picuCaseId}, transaction})
                // let i = 0;
                for (const item of data.items) {
                    // const pItem = newPicuCase.items.find(i => i.barcode === item.barcode && i.quantity === item.quantity);
                    // if (!pItem) {
                    //     console.log("Item not found")
                    //     console.log(item)
                    // }
                    await PicuCaseItem.create({
                        picuCaseId: newPicuCase.picuCaseId, ...item, ...item.product,
                        price: item.product.specialPriceUSD / (item.product.perBox > 0 ? item.product.perBox : 1)
                    }, {transaction})
                    // i++;
                }
                // console.log("created", i)
                // console.log("New Case Id:", newPicuCase.picuCaseId, "oldId", data.picuId, "Items compared, lengths", newPicuCase.items.length, data.items.length)
            }
            await transaction.commit();
        } catch (e) {
            console.log(e)
            await transaction.rollback();
        }
    }
).catch((e) => {
    console.log(e)
    process.exit(1);
});

