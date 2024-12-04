const {
    PatientPayment,
    SurgeryCase,
    OPData,
    SWData,
    ICUData,
    SurgeryPricing,
    Employee,
    SurgeryType,
    Patient,
    sequelize, PatientPaymentExpense, OPOperationType, ICUOperationType, SWOperationType, PatientPaymentLog, Safe,
    SafeLog, EmployeeWallet, EmployeeWalletLog
} = require("../../../models");
const {Op} = require("sequelize");

const include = [{
    model: SurgeryCase, as: 'surgeryCase', include: [{model: SurgeryType, as: 'surgeryType'}, {
        model: SurgeryPricing, as: 'pricings', include: [{model: Employee, as: 'employee'},]
    }]
}, {
    model: OPData, include: {model: OPOperationType}, attributes: {
        exclude: ['perfusionItems', 'anesthesiaItems', 'scrubNurseItems']
    }
}, {
    model: SWData, attributes: {
        exclude: ['items']
    }
}, {
    model: ICUData, attributes: {
        exclude: ['items']
    }
}, {
    model: Patient,
    as: 'Patient',
    include: [
        {
            model: SurgeryCase,
            as: 'surgeryCases',
            include: [{model: SurgeryType, as: 'surgeryType'}, {
                model: SurgeryPricing,
                as: 'pricings'
            }, {model: PatientPayment, as: 'patientPayment'}]
        },
        {
            model: ICUData, include: [{model: ICUOperationType}, {model: PatientPayment}], attributes: {
                exclude: ['items']
            }
        },
        {
            model: SWData, include: [{model: SWOperationType}, {model: PatientPayment}], attributes: {
                exclude: ['items']
            }
        },
        {
            model: OPData, include: [{model: OPOperationType}, {model: PatientPayment}], attributes: {
                exclude: ['perfusionItems', 'anesthesiaItems', 'scrubNurseItems']
            }
        },

    ]
},
    {model: PatientPaymentExpense, as: 'expenses'},
    {model: PatientPaymentLog, as: 'logs'}
]


const createPatientPayment = async (req, res) => {
    const patientPaymentData = req.body;
    try {
        const patientPayment = await PatientPayment.create(patientPaymentData);
        return res.status(201).json(patientPayment);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updatePatientPayment = async (req, res) => {
    const patientPaymentId = req.params.patientPaymentId;
    const patientPaymentData = req.body;
    try {
        const patientPayment = await PatientPayment.findByPk(patientPaymentId);
        if (!patientPayment) {
            return res.status(404).json({error: "Patient Payment not found"});
        }
        if (patientPayment.isClosed) {
            return res.status(400).json({error: "Patient Payment is already closed"});
        }
        await patientPayment.update(patientPaymentData);
        return res.status(204).json({message: "Patient Payment updated"});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const closePatientPayment = async (req, res) => {
    const patientPaymentId = req.params.patientPaymentId;
    const transaction = await sequelize.transaction();

    try {
        const patientPayment = await PatientPayment.findByPk(patientPaymentId, {include});
        if (!patientPayment) {
            return res.status(404).json({error: "Patient Payment not found"});
        }
        if (patientPayment.isClosed) {
            return res.status(400).json({error: "Patient Payment is already closed"});
        }
        const exchangeRate = 1500;
        // const {
        //     totalPricingsIQD,
        //     totalPricingsUSD,
        //     employeeWalletChanges
        // } = await calculatePricingChanges(
        //     patientPayment,
        //     exchangeRate,
        //     transaction
        // );

        const {paidUSD, paidIQD} = await calculatePaymentAmounts(
            patientPayment,
            exchangeRate
        );

        const safe = await Safe.findOne({
            where: {[Op.or]: [{safeId: 1}, {name: "Main"}]},
        });

        safe.balanceUSD += Number(paidUSD);
        safe.balanceIQD += Number(paidIQD);
        await safe.save({transaction});

        await SafeLog.create(
            {
                amountUSD: paidUSD,
                amountIQD: paidIQD,
                safeId: safe.safeId,
                // description: "Patient Payment Close, patientPaymentId=" + patientPaymentId,
                description: `Payment for patient ${patientPayment.Patient.fullname}`,
            },
            {transaction}
        );

        await patientPayment.update({isClosed: true}, {transaction});

        await transaction.commit();

        return res.status(204).json({message: "Patient Payment closed"});
    } catch (error) {
        await transaction.rollback();
        return res.status(400).json({error: error.message});
    }
};

const previewClosePatientPayment = async (req, res) => {
    const patientPaymentId = req.params.patientPaymentId;

    try {
        const patientPayment = await PatientPayment.findByPk(patientPaymentId, {include});
        if (!patientPayment) {
            return res.status(404).json({error: "Patient Payment not found"});
        }

        const exchangeRate = 1500;
        // const {
        //     totalPricingsIQD,
        //     totalPricingsUSD,
        //     employeeWalletChanges
        // } = await calculatePricingChanges(
        //     patientPayment,
        //     exchangeRate
        // );

        const {paidUSD, paidIQD} = await calculatePaymentAmounts(
            patientPayment,
            exchangeRate
        );

        const safe = await Safe.findOne({
            where: {[Op.or]: [{safeId: 1}, {name: "Main"}]},
        });

        const previewChanges = {
            paidUSD,
            paidIQD,
            safeBalanceUSD: safe.balanceUSD + paidUSD,
            safeBalanceIQD: safe.balanceIQD + paidIQD,
            isClosed: true,
            employeeWalletChanges: [],
            expenses: await PatientPaymentExpense.findAll({where: {patientPaymentId}}),
        };

        return res.status(200).json(previewChanges);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

const calculatePricingChanges = async (patientPayment, exchangeRate, transaction = null) => {
    let totalPricingsIQD = 0;
    let totalPricingsUSD = 0;
    // const pricingChanges = [];
    const employeeWalletChanges = [];

    // if (patientPayment.surgeryCase) {
    //     for (let pricing of patientPayment.surgeryCase.pricings) {
    //         const employee = await Employee.findByPk(pricing.employeeId, {
    //             include: [{model: EmployeeWallet, as: "wallet"}],
    //         });
    //
    //         if (!employee.wallet) {
    //             employee.wallet = await EmployeeWallet.create(
    //                 {employeeId: employee.employeeId},
    //                 {transaction}
    //             );
    //         }
    //
    //         // const {pricingIQD, pricingUSD, employeeWalletChange} = await updateBalances(
    //         //     pricing,
    //         //     employee,
    //         //     exchangeRate,
    //         //     transaction
    //         // );
    //         //
    //         // totalPricingsIQD += pricingIQD;
    //         // totalPricingsUSD += pricingUSD;
    //
    //         // pricingChanges.push({
    //         //     pricingId: pricing.pricingId,
    //         //     pricingName: pricing.name,
    //         //     pricingIQD,
    //         //     pricingUSD,
    //         // });
    //
    //         employeeWalletChanges.push({...employeeWalletChange, pricingName: pricing.name});
    //     }
    // }

    return {totalPricingsIQD, totalPricingsUSD, employeeWalletChanges};
};

const calculatePaymentAmounts = async (patientPayment, exchangeRate) => {
    // const totalExpenses = await PatientPaymentExpense.sum("price", {
    //     where: {patientPaymentId: patientPayment.patientPaymentId},
    // });

    let paidUSD = patientPayment.totalPaidUSD;
    // let paidIQD = patientPayment.totalPaidIQD - totalExpenses;
    let paidIQD = patientPayment.totalPaidIQD;

    if (paidUSD > 0 && paidIQD < 0 && Math.abs(paidIQD) > paidUSD * exchangeRate) {
        throw new Error("Not enough IQD to close the payment");
    }
    if (paidUSD < 0 && paidIQD > 0 && Math.abs(paidUSD) > paidIQD / exchangeRate) {
        throw new Error("Not enough USD to close the payment");
    }

    if (paidUSD < 0 && paidIQD < 0) {
        paidIQD += paidUSD * exchangeRate;
        paidUSD = 0;
    } else if (paidUSD > 0 && paidIQD < 0) {
        paidUSD += paidIQD / exchangeRate;
        paidIQD = 0;
    }

    return {paidUSD, paidIQD};
};

const updateBalances = async (pricing, employee, exchangeRate, transaction) => {
    // let pricingIQD = 0;
    // let pricingUSD = 0;
    //
    // if (pricing.currencyId === 1) {
    //     pricingIQD = pricing.fee;
    //     if (pricing.feeTypeId === 1) {
    //         pricingIQD *= pricing.fee / 100;
    //     }
    //     pricingIQD *= exchangeRate;
    // } else {
    //     pricingUSD = pricing.fee;
    //     if (pricing.feeTypeId === 1) {
    //         pricingUSD *= pricing.fee / 100;
    //     }
    // }
    //
    // employee.wallet.balanceIQD += pricingIQD;
    // employee.wallet.balanceUSD += pricingUSD;
    //
    // if (transaction) {
    //     await EmployeeWalletLog.create(
    //         {
    //             amountIQD: pricingIQD,
    //             amountUSD: pricingUSD,
    //             employeeId: employee.employeeId,
    //             description: "Surgery Pricing, surgeryCaseId=" + pricing.surgeryCaseId,
    //         },
    //         {transaction}
    //     );
    //     await employee.wallet.save({transaction});
    // }
    //
    // const employeeWalletChange = {
    //     employeeId: employee.employeeId,
    //     employeeName: employee.firstName + " " + employee.middleName + " " + employee.lastName,
    //     walletId: employee.wallet.walletId,
    //     balanceIQD: employee.wallet.balanceIQD,
    //     changeIQD: pricingIQD,
    //     balanceUSD: employee.wallet.balanceUSD,
    //     changeUSD: pricingUSD,
    // };
    //
    // return {pricingIQD, pricingUSD, employeeWalletChange};
};


const updatePatientPaymentInsurance = async (req, res) => {
    const patientPaymentId = req.params.patientPaymentId;
    const {insurance} = req.body;
    const transaction = await sequelize.transaction();
    try {
        const patientPayment = await PatientPayment.findByPk(patientPaymentId);
        if (!patientPayment) {
            return res.status(404).json({error: "Patient Payment not found"});
        }
        if (patientPayment.isClosed) {
            return res.status(400).json({error: "Patient Payment is already closed"});
        }
        const change = insurance - patientPayment.insurance;
        await PatientPaymentLog.create({
            patientPaymentId,
            amount: change,
            currencyId: 1,
            note: "Insurance"
        }, {transaction});
        await patientPayment.update({
            insurance,
            totalPaidIQD: patientPayment.totalPaidIQD + change
        }, {transaction});
        await transaction.commit();
        return res.status(204).json({message: "Patient Payment updated"});
    } catch (error) {
        await transaction.rollback();
        return res.status(400).json({error: error.message});
    }
};

const deletePatientPayment = async (req, res) => {
    const patientPaymentId = req.params.patientPaymentId;
    try {
        const patientPayment = await PatientPayment.findByPk(patientPaymentId);
        if (!patientPayment) {
            return res.status(404).json({error: "Patient Payment not found"});
        }
        if (patientPayment.isClosed) {
            return res.status(400).json({error: "Patient Payment is already closed"});
        }
        await patientPayment.destroy();
        return res.status(200).json({message: "Patient Payment deleted"});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};
const getPatientPayments = async (req, res) => {
        const where = {};
        if (req.query.from) {
            where.createdAt = {[Op.gt]: req.query.from};
        }
        if (req.query.to) {
            if (where.createdAt) {
                where.createdAt = {...where.createdAt, [Op.lt]: req.query.to};
            } else {
                where.createdAt = {[Op.lt]: req.query.to};
            }
        }
        try {
            const patientPayments = await PatientPayment.findAll({include, where});
            const cleanedPatientPayments = [];
            // for (const ppModel of patientPayments) {
            //     const ppData = ppModel.get({plain: true});
            //     cleanedPatientPayments.push({
            //         ...ppData,
            //         ICUDatum: ppData.ICUDatum ? {...ppData.ICUDatum, items: cleanItems(ppData.ICUDatum.items)} : null,
            //         SWDatum: ppData.SWDatum ? {...ppData.SWDatum, items: cleanItems(ppData.SWDatum.items)} : null,
            //         OPDatum: ppData.OPDatum ? {
            //             ...ppData.OPDatum,
            //             perfusionItems: cleanItems(ppData.OPDatum.perfusionItems),
            //             anesthesiaItems: cleanItems(ppData.OPDatum.anesthesiaItems),
            //             scrubNurseItems: cleanItems(ppData.OPDatum.scrubNurseItems)
            //         } : null,
            //         Patient: {
            //             ...ppData.Patient,
            //             ICUData: ppData.Patient.ICUData.map(icu => ({
            //                 ...icu,
            //                 items: cleanItems(icu.items)
            //             })),
            //             SWData: ppData.Patient.SWData.map(sw => ({
            //                 ...sw,
            //                 items: cleanItems(sw.items)
            //             })),
            //             OPData: ppData.Patient.OPData.map(op => ({
            //                 ...op,
            //                 perfusionItems: cleanItems(op.perfusionItems),
            //                 anesthesiaItems: cleanItems(op.anesthesiaItems),
            //                 scrubNurseItems: cleanItems(op.scrubNurseItems)
            //             })),
            //         }
            //     });
            // }
            for (const ppModel of patientPayments) {
                const ppData = ppModel.get({plain: true});
                cleanedPatientPayments.push({
                    ...ppData,
                    ICUDatum: ppData.ICUDatum ? {...ppData.ICUDatum, items: []} : null,
                    SWDatum: ppData.SWDatum ? {...ppData.SWDatum, items: []} : null,
                    OPDatum: ppData.OPDatum ? {
                        ...ppData.OPDatum,
                        perfusionItems: [],
                        anesthesiaItems: [],
                        scrubNurseItems: []
                    } : null,
                    Patient: {
                        ...ppData.Patient,
                        ICUData: ppData.Patient.ICUData.map(icu => ({
                            ...icu,
                            items: []
                        })),
                        SWData: ppData.Patient.SWData.map(sw => ({
                            ...sw,
                            items: []
                        })),
                        OPData: ppData.Patient.OPData.map(op => ({
                            ...op,
                            perfusionItems: [],
                            anesthesiaItems: [],
                            scrubNurseItems: []
                        })),
                    }
                });
            }
            return res.status(200).json(cleanedPatientPayments.sort((a, b) => b.patientPaymentId - a.patientPaymentId));
            // return res.status(200).json(patientPayments.sort((a, b) => b.patientPaymentId - a.patientPaymentId));
        } catch (error) {
            console.log(error);
            return res.status(400).json({error: error.message});
        }
    }
;

const cleanItems = (items) => {
    return items.map(item => ({
        barcode: item.barcode,
        product: {
            code: item.product.code,
            name: item.product.name,
            size: item.product.size,
            image: item.product.image,
            barcode: item.product.barcode,
            specialPriceUSD: item.product.specialPriceUSD
        },
        quantity: item.quantity
    }));
}

const getPatientPayment = async (req, res) => {
    const patientPaymentId = req.params.patientPaymentId;
    try {
        const patientPayment = await PatientPayment.findByPk(patientPaymentId, {include});
        return res.status(200).json(patientPayment);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createPatientPayment, updatePatientPayment, updatePatientPaymentInsurance,
    deletePatientPayment, getPatientPayments, getPatientPayment, closePatientPayment, previewClosePatientPayment
};