const {Product, ProductStorage, User, Notification, Role, MeetingParticipant, Meeting, Employee} = require("../models");


async function checkProductsOnStorages() {
    await runChecks();
    setInterval(async () => {
        await runChecks();
    }, 60 * 60 * 1000)
}

async function runChecks() {
    try {
        const products = await Product.findAll({include: [{model: ProductStorage}]})
        checkExpiredProducts(products)
        checkExpireThresholdProducts(products)
        checkLowQuantityProducts(products)
    } catch (e) {
        console.log(e)
    }
}

function checkExpiredProducts(products) {
    products.forEach(product => {
        product.ProductStorages
            .filter(productStorage => new Date(productStorage.expireDate) < Date.now() && productStorage.quantity > 0)
            .forEach(async productStorage => {
                await notifyAdmins(
                    "Expired product",
                    `Product ${product.name} with barcode ${product.barcode} has expired on ${productStorage.expireDate.toLocaleDateString().substring(0, 10)}`,
                    `/warehouse/storage?s=${product.barcode}`
                )
            })
    })
}

function checkLowQuantityProducts(products) {
    products.map(product => {
        return {
            ...product, quantity: product.ProductStorages.reduce((acc, productStorage) => {
                return acc + productStorage.quantity
            }, 0)
        }
    }).filter(product => (product.quantity / product.perBox) < product.threshold)
        .forEach(async product => {
            await notifyAdmins(
                "Low quantity product",
                // `Product ${product.name} with barcode ${product.barcode} has low quantity (${product.quantity})`,
                `Product ${product.name} with barcode ${product.barcode} has low quantity`,
                `/warehouse/storage?s=${product.barcode}`
            )
        })
}

function checkExpireThresholdProducts(products) {
    products.forEach(product => {
        product.ProductStorages
            .filter(productStorage => new Date(productStorage.expireDate).getTime() < new Date().getTime() - (product.expireThreshold * 24 * 60 * 60 * 1000) && productStorage.quantity > 0)
            .forEach(async productStorage => {
                await notifyAdmins(
                    "Expired threshold",
                    `Product ${product.name} with barcode ${product.barcode} will expire on ${productStorage.expireDate.toLocaleDateString().substring(0, 10)}`,
                    `/warehouse/storage?s=${product.barcode}`
                )
            })
    })
}

async function notifyAdmins(title, description, href) {
    const admins = (await User.findAll({include: [{model: Role}]})).filter(user => user.Role.permissions.includes(0))
    for (const admin of admins) {
        // const alreadyNotified = await Notification.findOne({
        //     where: {
        //         userId: admin.userId,
        //         title,
        //         description,
        //         href
        //     }
        // })
        // if (!alreadyNotified) {
        //     await Notification.create({
        //         userId: admin.userId,
        //         title,
        //         description,
        //         href,
        //         isRead: false
        //     })
        // }
    }
}

async function sendMeetingNotification(employee, meeting, type) {
    let title, description;

    switch (type) {
        case 'created':
            title = 'New Meeting Scheduled';
            description = `A new meeting "${meeting.title}" has been scheduled for ${meeting.startTime.toLocaleString()}`;
            break;
        case 'reminder':
            title = 'Meeting Reminder';
            description = `Reminder: Meeting "${meeting.title}" starts in 24 minutes`;
            break;
    }
    console.log(employee.userId, title, description)
}

async function scheduleMeetingReminders() {
    // const twentyFourMinutesFromNow = new Date(Date.now() + 24 * 60 * 1000);
    // const upcomingMeetings = await Meeting.findAll({
    //     where: {
    //         startTime: twentyFourMinutesFromNow,
    //         status: 'Scheduled'
    //     },
    //     include: [{
    //         model: MeetingParticipant, include: [{
    //             model: Employee, as: 'employee', include: [{
    //                 model: User, as: 'user'
    //             }]
    //         }]
    //     }]
    // });
    //
    // for (const meeting of upcomingMeetings) {
    //     for (const participant of meeting.participants) {
    //         await sendMeetingNotification(participant.employee.User, meeting, 'reminder');
    //     }
    // }
}

// Run meeting reminder checks every minute
setInterval(scheduleMeetingReminders, 60 * 1000);

module.exports = {
    checkProductsOnStorages,
    sendMeetingNotification
}
