const {PerfusionCaseItem, PerfusionCase, sequelize, Product, ProductStorage} = require("../../models");

const systemStorageId = 8;

const createPerfusionCaseItem = async (req, res) => {
    const perfusionCaseId = req.params.perfusionCaseId;
    const perfusionCaseItemData = req.body;
    try {
        const perfusionCaseItem = await PerfusionCaseItem.create({...perfusionCaseItemData, perfusionCaseId});
        return res.status(201).json(perfusionCaseItem);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const createBatchPerfusionCaseItem = async (req, res) => {
    const perfusionCaseId = req.params.perfusionCaseId;
    const perfusionCaseItems = req.body;
    const transaction = await sequelize.transaction();
    try {
        for (const perfusionCaseItemData of perfusionCaseItems) {
            let quantity = perfusionCaseItemData.quantity;
            const productsInStorage = await ProductStorage.findAll({
                where: {
                    storageId: systemStorageId,
                    barcode: perfusionCaseItemData.barcode
                }
            });
            const totalAvailable = productsInStorage.reduce((acc, product) => acc + product.quantity, 0);
            if (totalAvailable < quantity) {
                await transaction.rollback();
                return res.status(400).json({error: 'Insufficient stock'});
            }
            for (const product of productsInStorage) {
                if (product.quantity >= quantity) {
                    await product.update({quantity: product.quantity - quantity}, {transaction});
                    quantity = 0;
                    break;
                } else {
                    quantity -= product.quantity;
                    await product.update({quantity: 0}, {transaction});
                }
            }
            if (quantity > 0) {
                await transaction.rollback();
                return res.status(400).json({error: 'Insufficient stock'});
            }
            await PerfusionCaseItem.create({...perfusionCaseItemData, perfusionCaseId}, {transaction});
        }
        await transaction.commit();
        return res.status(201).json({message: 'Perfusion case items created'});
    } catch (error) {
        await transaction.rollback();
        return res.status(400).json({error: error.message});
    }
};

const updatePerfusionCaseItem = async (req, res) => {
    // const perfusionCaseItemId = req.params.perfusionCaseItemId;
    // const perfusionCaseItemData = req.body;
    // try {
    //     const perfusionCaseItem = await PerfusionCaseItem.findByPk(perfusionCaseItemId);
    //     if (!perfusionCaseItem) {
    //         return res.status(404).json({error: 'Perfusion case item not found'});
    //     }
    //     delete perfusionCaseItemData.perfusionCaseItemId;
    //     delete perfusionCaseItemData.perfusionCaseId;
    //     await perfusionCaseItem.update(perfusionCaseItemData);
    //     return res.status(204).json({message: 'Perfusion case item updated'});
    // } catch (error) {
    //     return res.status(400).json({error: error.message});
    // }
};

const deletePerfusionCaseItem = async (req, res) => {
    // const perfusionCaseItemId = req.params.perfusionCaseItemId;
    // try {
    //     const perfusionCaseItem = await PerfusionCaseItem.findByPk(perfusionCaseItemId);
    //     if (!perfusionCaseItem) {
    //         return res.status(404).json({error: 'Perfusion case item not found'});
    //     }
    //     await perfusionCaseItem.destroy();
    //     return res.status(200).json({message: 'Perfusion case item deleted'});
    // } catch (error) {
    //     return res.status(400).json({error: error.message});
    // }
};

const getPerfusionCaseItems = async (req, res) => {
    const perfusionCaseId = req.params.perfusionCaseId;
    try {
        const perfusionCase = await PerfusionCase.findByPk(perfusionCaseId);
        if (!perfusionCase) {
            return res.status(404).json({error: 'Perfusion case not found'});
        }
        const perfusionCaseItems = await PerfusionCaseItem.findAll({where: {perfusionCaseId}});
        return res.status(200).json(perfusionCaseItems);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPerfusionCaseItem = async (req, res) => {
    const perfusionCaseItemId = req.params.perfusionCaseItemId;
    try {
        const perfusionCaseItem = await PerfusionCaseItem.findByPk(perfusionCaseItemId);
        if (!perfusionCaseItem) {
            return res.status(404).json({error: 'Perfusion case item not found'});
        }
        return res.status(200).json(perfusionCaseItem);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createPerfusionCaseItem,
    updatePerfusionCaseItem,
    deletePerfusionCaseItem,
    getPerfusionCaseItems,
    getPerfusionCaseItem,
    createBatchPerfusionCaseItem
};