const router = require("../../config/express")
const {Op} = require('sequelize');
const {
    ProductStorage,
    Product,
    sequelize,
    User,
    Buy,
    BuyDebt,
} = require('../../models');

// Function to fill missing periods with zero values
const fillMissingPeriods = (data, period, startDate, endDate) => {
    const filledData = [];
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (currentDate <= endDateObj) {
        const currentPeriod =
            period === 'daily'
                ? currentDate.toISOString().split('T')[0]
                : period === 'weekly'
                    ? `Week ${getWeekNumber(currentDate)}`
                    : `Month ${currentDate.getMonth() + 1}`;

        const existingData = data.find((item) => item.date === currentPeriod);

        if (existingData) {
            filledData.push(existingData);
        } else {
            filledData.push({
                date: currentPeriod,
                totalProfit: 0,
                totalSales: 0,
                totalBuys: 0,
            });
        }

        if (period === 'daily') {
            currentDate.setDate(currentDate.getDate() + 1);
        } else if (period === 'weekly') {
            currentDate.setDate(currentDate.getDate() + 7);
        } else if (period === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
    }

    return filledData;
};

// Helper function to get the week number of a date
const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Route to get statistics
router.get('/warehouse/stats', async (req, res) => {
    try {
        const {startDate, endDate, period} = req.query;

        // Fetch total buys
        const totalBuysUSD = await fetchTotalBuys(startDate, endDate, period, 0);

        const filledTotalBuysUSD = fillMissingPeriods(totalBuysUSD, period, startDate, endDate);

        res.json({
            totalBuys: filledTotalBuysUSD
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }
});

// Function to fetch total buys
const fetchTotalBuys = async (startDate, endDate, period) => {
    const where = {};

    if (startDate && endDate) {
        where.date = {
            [Op.between]: [new Date(startDate), new Date(endDate)],
        };
    }

    if (period === 'daily') {
        const dailyBuys = await Buy.findAll({
            where,
            attributes: [
                [sequelize.fn('date', sequelize.col('date')), 'date'],
                [sequelize.fn('sum', sequelize.col('totalPrice')), 'totalBuys'],
            ],
            group: [sequelize.fn('date', sequelize.col('date'))],
            order: [['date', 'ASC']],
        });

        return dailyBuys.map((buy) => ({
            date: buy.dataValues.date,
            totalBuys: buy.dataValues.totalBuys,
        }));
    }

    if (period === 'weekly') {
        const weeklyBuys = await Buy.findAll({
            where,
            attributes: [
                [sequelize.fn('week', sequelize.col('date')), 'week'],
                [sequelize.fn('sum', sequelize.col('totalPrice')), 'totalBuys'],
            ],
            group: [sequelize.fn('week', sequelize.col('date'))],
            order: [['week', 'ASC']],
        });

        return weeklyBuys.map((buy) => ({
            week: buy.dataValues.week,
            totalBuys: buy.dataValues.totalBuys,
        }));
    }

    if (period === 'monthly') {
        const monthlyBuys = await Buy.findAll({
            where,
            attributes: [
                [sequelize.fn('month', sequelize.col('date')), 'month'],
                [sequelize.fn('sum', sequelize.col('totalPrice')), 'totalBuys'],
            ],
            group: [sequelize.fn('month', sequelize.col('date'))],
            order: [['month', 'ASC']],
        });

        return monthlyBuys.map((buy) => ({
            month: buy.dataValues.month,
            totalBuys: buy.dataValues.totalBuys,
        }));
    }

    if (startDate && endDate) {
        const totalBuys = await Buy.sum('totalPrice', {
            where: {
                date: {
                    [Op.between]: [new Date(startDate), new Date(endDate)],
                },
            },
        });

        return [{totalBuys: totalBuys}];
    }

    return [];
};

module.exports = router;
