require('dotenv').config()
const {initializeDB} = require("./lib/db")
const {
    OPData,
    PerfusionCase,
    PerfusionCaseItem,
    AnesthesiaCaseItem,
    ScrubNurseCaseItem,
    ScrubNurseCase,
    AnesthesiaCase,
    sequelize
} = require("./models");
initializeDB().then(async () => {
        console.log("Database initialized")
        const opDatas = await OPData.findAll();
        const transaction = await sequelize.transaction();
        try {
            let i = 0;
            for (const opData of opDatas) {
                console.log(`Processing ${++i}/${opDatas.length}`)
                const data = opData.get({plain: true});
                const perfusionCase = await PerfusionCase.create({
                    patientId: data.patientId,
                    entryTime: data.entryTime,
                    exitTime: data.exitTime,
                }, {transaction});
                for (const item of data.perfusionItems) {
                    await PerfusionCaseItem.create({
                        perfusionCaseId: perfusionCase.perfusionCaseId, ...item, ...item.product,
                        price: item.product.specialPriceUSD / (item.product.perBox > 0 ? item.product.perBox : 1)
                    }, {transaction})
                }
                const anesthesiaCase = await AnesthesiaCase.create({
                    patientId: data.patientId,
                    entryTime: data.entryTime,
                    exitTime: data.exitTime,
                });
                for (const item of data.anesthesiaItems) {
                    await AnesthesiaCaseItem.create({
                        anesthesiaCaseId: anesthesiaCase.anesthesiaCaseId, ...item, ...item.product,
                        price: item.product.specialPriceUSD / (item.product.perBox > 0 ? item.product.perBox : 1)
                    }, {transaction})
                }
                const scrubNurseCase = await ScrubNurseCase.create({
                    patientId: data.patientId,
                    entryTime: data.entryTime,
                    exitTime: data.exitTime,
                });
                for (const item of data.scrubNurseItems) {
                    await ScrubNurseCaseItem.create({
                        scrubNurseCaseId: scrubNurseCase.scrubNurseCaseId, ...item, ...item.product,
                        price: item.product.specialPriceUSD / (item.product.perBox > 0 ? item.product.perBox : 1)
                    }, {transaction})
                }
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

