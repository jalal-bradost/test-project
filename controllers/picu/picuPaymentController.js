const {Op} = require("sequelize");
const {
    PicuPayment,
    sequelize,
    PicuCase,
    Patient,
    PicuCaseTime,
    PicuCaseService,
    PicuCaseItem
} = require("../../models");

const include = [
    {
        model: PicuCase,
        as: "picuCase",
        include: [
            {
                model: Patient,
                as: "patient",
            },
            {
                model: PicuCaseTime,
                as: "times"
            },
            {
                model: PicuCaseService,
                as: "services"
            },
            {
                model: PicuCaseItem,
                as: "items"
            }
        ]
    }
]


const createPicuPayment = async (req, res) => {
    const picuPaymentData = req.body;
    try {
        const picuPayment = await PicuPayment.create(picuPaymentData);
        return res.status(201).json(picuPayment);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updatePicuPayment = async (req, res) => {
    const picuPaymentId = req.params.picuPaymentId;
    const picuPaymentData = req.body;
    try {
        const picuPayment = await PicuPayment.findByPk(picuPaymentId);
        if (!picuPayment) {
            return res.status(404).json({error: "Patient Payment not found"});
        }
        if (picuPayment.isClosed) {
            return res.status(400).json({error: "Patient Payment is already closed"});
        }
        await picuPayment.update(picuPaymentData);
        return res.status(204).json({message: "Patient Payment updated"});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updatePicuPaymentInsurance = async (req, res) => {
    const picuPaymentId = req.params.picuPaymentId;
    const {insurance} = req.body;
    const transaction = await sequelize.transaction();
    try {
        const picuPayment = await PicuPayment.findByPk(picuPaymentId);
        if (!picuPayment) {
            return res.status(404).json({error: "Patient Payment not found"});
        }
        if (picuPayment.isClosed) {
            return res.status(400).json({error: "Patient Payment is already closed"});
        }
        // await PicuPaymentLog.create({
        //     picuPaymentId,
        //     amount: change,
        //     currencyId: 1,
        //     note: "Insurance"
        // }, {transaction});
        await picuPayment.update({
            insurance
        }, {transaction});
        await transaction.commit();
        return res.status(204).json({message: "Patient Payment updated"});
    } catch (error) {
        await transaction.rollback();
        return res.status(400).json({error: error.message});
    }
};

const deletePicuPayment = async (req, res) => {
    const picuPaymentId = req.params.picuPaymentId;
    try {
        const picuPayment = await PicuPayment.findByPk(picuPaymentId);
        if (!picuPayment) {
            return res.status(404).json({error: "Patient Payment not found"});
        }
        if (picuPayment.isClosed) {
            return res.status(400).json({error: "Patient Payment is already closed"});
        }
        await picuPayment.destroy();
        return res.status(200).json({message: "Patient Payment deleted"});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};
const getPicuPayments = async (req, res) => {
    try {
        const picuPayments = await PicuPayment.findAll({include});
        return res.status(200).json(picuPayments);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

const getPicuPayment = async (req, res) => {
    const picuPaymentId = req.params.picuPaymentId;
    try {
        const picuPayment = await PicuPayment.findByPk(picuPaymentId, {include});
        return res.status(200).json(picuPayment);
    } catch (error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createPicuPayment, updatePicuPayment, updatePicuPaymentInsurance,
    deletePicuPayment, getPicuPayments, getPicuPayment
};