const {
    SurgeryCase,
    Patient,
    SurgeryType,
    SurgeryPricing,
    sequelize,
    EmployeeWallet,
    Safe,
    SafeLog, Employee
} = require("../../../models");
const {Op} = require("sequelize");

const createSurgeryCase = async (req, res) => {
    const surgeryCaseData = req.body;
    const transaction = await sequelize.transaction();
    try {
        const surgeryCase = await SurgeryCase.create(surgeryCaseData);
        if (surgeryCaseData.pricings) {
            for (const surgeryPricingData of surgeryCaseData.pricings) {
                const surgeryPricing = await SurgeryPricing.create({...surgeryPricingData, surgeryCaseId: surgeryCase.surgeryCaseId}, {transaction});
                // const surgeryCase = await SurgeryCase.findByPk(surgeryPricingData.surgeryCaseId);
                const employeeWallet = await EmployeeWallet.findOrCreate({
                    where: {employeeId: surgeryPricingData.employeeId}, transaction
                });
                const employee = await Employee.findByPk(surgeryPricingData.employeeId);
                const patient = await Patient.findByPk(surgeryCase.patientId);
                let pricingIQD = 0;
                let pricingUSD = 0;
                const exchangeRate = surgeryCaseData.exchangeRate || 1500;
                if (surgeryPricingData.currencyId === 1) {
                    pricingIQD = surgeryPricingData.fee;
                    if (surgeryPricingData.feeTypeId === 1) {
                        pricingIQD = (surgeryPricingData.fee / 100) * surgeryCaseData.surgeryPrice;
                        pricingIQD *= exchangeRate;
                    }
                } else {
                    pricingUSD = surgeryPricingData.fee;
                    if (surgeryPricingData.feeTypeId === 1) {
                        pricingUSD = (surgeryPricingData.fee / 100) * surgeryCaseData.surgeryPrice;
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
                    // description: "Surgery Pricing surgeryCaseId=" + surgeryCase.surgeryCaseId,
                }, {transaction});
                await employeeWallet[0].update({
                    balanceUSD: employeeWallet[0].balanceUSD + pricingUSD,
                    balanceIQD: Math.round(employeeWallet[0].balanceIQD + pricingIQD),
                }, {transaction});
            }
        }
        await transaction.commit();
        return res.status(201).json(surgeryCase);
    } catch (error) {
        await transaction.rollback();
        return res.status(400).json({error: error.message});
    }
};

const updateSurgeryCase = async (req, res) => {
    const surgeryCaseId = req.params.surgeryCaseId;
    const surgeryCaseData = req.body;
    try {
        const surgeryCase = await SurgeryCase.findByPk(surgeryCaseId);
        if (!surgeryCase) {
            return res.status(404).json({error: "Surgery Case not found"});
        }
        await surgeryCase.update(surgeryCaseData);
        return res.status(204).json({message: "Surgery Case updated"});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deleteSurgeryCase = async (req, res) => {
    const surgeryCaseId = req.params.surgeryCaseId;
    try {
        const surgeryCase = await SurgeryCase.findByPk(surgeryCaseId);
        if (!surgeryCase) {
            return res.status(404).json({error: "Surgery Case not found"});
        }
        await surgeryCase.destroy();
        return res.status(200).json({message: "Surgery Case deleted"});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getSurgeryCases = async (req, res) => {
    try {
        const surgeryCases = await SurgeryCase.findAll({
            include: [
                {
                    model: Patient,
                    as: "patient"
                },
                {
                    model: SurgeryType,
                    as: "surgeryType"
                },
                {
                    model: SurgeryPricing,
                    as: "pricings"
                }
            ]
        });
        return res.status(200).json(surgeryCases);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

const getSurgeryCase = async (req, res) => {
    const surgeryCaseId = req.params.surgeryCaseId;
    try {
        const surgeryCase = await SurgeryCase.findByPk(surgeryCaseId, {
            include: [
                {
                    model: Patient,
                    as: "patient"
                },
                {
                    model: SurgeryType,
                    as: "surgeryType"
                },
                {
                    model: SurgeryPricing,
                    as: "pricings"
                }
            ]
        });
        return res.status(200).json(surgeryCase);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createSurgeryCase,
    updateSurgeryCase,
    deleteSurgeryCase,
    getSurgeryCases,
    getSurgeryCase,
};