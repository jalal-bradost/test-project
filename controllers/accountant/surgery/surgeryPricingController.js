const {
    SurgeryPricing, sequelize, EmployeeWallet, Safe, SafeLog, SurgeryCase, EmployeeWalletLog, Employee, Patient
} = require("../../../models");
const {Op} = require("sequelize");

const createSurgeryPricing = async (req, res) => {
    const surgeryPricingData = req.body;
    const transaction = await sequelize.transaction();
    try {
        const surgeryPricing = await SurgeryPricing.create(surgeryPricingData, {transaction});
        const surgeryCase = await SurgeryCase.findByPk(surgeryPricingData.surgeryCaseId);
        const employeeWallet = await EmployeeWallet.findOrCreate({
            where: {employeeId: surgeryPricingData.employeeId}, transaction
        });
        const employee = await Employee.findByPk(surgeryPricingData.employeeId);
        const patient = await Patient.findByPk(surgeryCase.patientId);
        let pricingIQD = 0;
        let pricingUSD = 0;
        const exchangeRate = surgeryPricingData.exchangeRate || 1500;
        if (surgeryPricingData.currencyId === 1) {
            pricingIQD = surgeryPricingData.fee;
            if (surgeryPricingData.feeTypeId === 1) {
                pricingIQD = (surgeryPricingData.fee / 100) * surgeryCase.surgeryPrice;
                pricingIQD *= exchangeRate;
            }
        } else {
            pricingUSD = surgeryPricingData.fee;
            if (surgeryPricingData.feeTypeId === 1) {
                pricingUSD = (surgeryPricingData.fee / 100) * surgeryCase.surgeryPrice;
            }
        }
        const safe = await Safe.findOne({
            where: {[Op.or]: [{safeId: 1}, {name: "Main"}]},
        });
        safe.balanceIQD -= Math.round(pricingIQD);
        safe.balanceUSD -= pricingUSD;
        await safe.save({transaction});
        await SafeLog.create({
            amountUSD: -pricingUSD,
            amountIQD: -Math.round(pricingIQD),
            safeId: safe.safeId,
            description: `Per case Employee (${employee.firstName} ${employee.middleName} ${employee.lastName}) for Case (${patient.fullname})`,
        }, {transaction});
        await employeeWallet[0].update({
            balanceUSD: employeeWallet[0].balanceUSD + pricingUSD,
            balanceIQD: Math.round(employeeWallet[0].balanceIQD + pricingIQD),
        }, {transaction});
        await transaction.commit();
        return res.status(201).json(surgeryPricing);
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        return res.status(400).json({error: error.message});
    }
};

const updateSurgeryPricing = async (req, res) => {
    const surgeryPricingId = req.params.surgeryPricingId;
    const surgeryPricingData = req.body;
    try {
        const surgeryPricing = await SurgeryPricing.findByPk(surgeryPricingId);
        if (!surgeryPricing) {
            return res.status(404).json({error: 'Surgery Pricing not found'});
        }
        await surgeryPricing.update(surgeryPricingData);
        return res.status(204).json({message: 'Surgery Pricing updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const paySurgeryPricing = async (req, res) => {
    const surgeryPricingId = req.params.surgeryPricingId;
    const transaction = await sequelize.transaction();
    const {exchangeRate} = req.body;
    try {
        const surgeryPricing = await SurgeryPricing.findByPk(surgeryPricingId, {
            include: [{
                model: SurgeryCase, as: "surgeryCase"
            }]
        });
        if (!surgeryPricing) {
            return res.status(404).json({error: 'Surgery Pricing not found'});
        }
        if (surgeryPricing.isPaid) {
            return res.status(400).json({error: 'Surgery Pricing already paid'});
        }
        if (!surgeryPricing.surgeryCase) {
            return res.status(400).json({error: 'Surgery Case not found'});
        }
        await surgeryPricing.update({isPaid: true}, {transaction});
        let amountIQD = 0;
        let amountUSD = 0;
        if (surgeryPricing.currencyId === 1) {
            amountIQD = surgeryPricing.fee;
            if (surgeryPricing.feeTypeId === 1) {
                amountIQD *= (surgeryPricing.fee / 100) * surgeryPricing.surgeryCase.surgeryPrice;
                amountIQD *= exchangeRate;
            }
        } else {
            amountUSD = surgeryPricing.fee;
            if (surgeryPricing.feeTypeId === 1) {
                amountUSD *= (surgeryPricing.fee / 100) * surgeryPricing.surgeryCase.surgeryPrice;
            }
        }
        await EmployeeWalletLog.create({
            employeeId: surgeryPricing.employeeId,
            amountIQD: -Math.round(amountIQD),
            amountUSD: -amountUSD,
            description: "Surgery Pricing Paid, surgeryPricingId=" + surgeryPricing.surgeryPricingId,
        }, {transaction});
        await EmployeeWallet.decrement({
            balanceIQD: Math.round(amountIQD),
            balanceUSD: amountUSD
        }, {where: {employeeId: surgeryPricing.employeeId}, transaction});
        await transaction.commit();
        return res.status(204).json({message: 'Surgery Pricing updated'});
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
}

const deleteSurgeryPricing = async (req, res) => {
    const surgeryPricingId = req.params.surgeryPricingId;
    try {
        const surgeryPricing = await SurgeryPricing.findByPk(surgeryPricingId);
        if (!surgeryPricing) {
            return res.status(404).json({error: 'Surgery Pricing not found'});
        }
        await surgeryPricing.destroy();
        return res.status(200).json({message: 'Surgery Pricing deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getSurgeryPricings = async (req, res) => {
    try {
        const surgeryPricings = await SurgeryPricing.findAll();
        return res.status(200).json(surgeryPricings);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

const getSurgeryPricing = async (req, res) => {
    const surgeryPricingId = req.params.surgeryPricingId;
    try {
        const surgeryPricing = await SurgeryPricing.findByPk(surgeryPricingId);
        return res.status(200).json(surgeryPricing);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createSurgeryPricing,
    updateSurgeryPricing,
    deleteSurgeryPricing,
    getSurgeryPricings,
    getSurgeryPricing,
    paySurgeryPricing
};