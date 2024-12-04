const {PicuCaseItem, PicuCase, sequelize, Product, ProductStorage} = require("../../models");

const systemStorageId = 17;

const createPicuCaseItem = async (req, res) => {
    const picuCaseId = req.params.picuCaseId;
    const picuCaseItemData = req.body;
    try {
        const picuCaseItem = await PicuCaseItem.create({...picuCaseItemData, picuCaseId});
        return res.status(201).json(picuCaseItem);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const createBatchPicuCaseItem = async (req, res) => {
    const picuCaseId = req.params.picuCaseId;
    const picuCaseItems = req.body;
    const transaction = await sequelize.transaction();
    try {
        for (const picuCaseItemData of picuCaseItems) {
            let quantity = picuCaseItemData.quantity;
            const productsInStorage = await ProductStorage.findAll({
                where: {
                    storageId: systemStorageId,
                    barcode: picuCaseItemData.barcode
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
            await PicuCaseItem.create({...picuCaseItemData, picuCaseId}, {transaction});
        }
        await transaction.commit();
        return res.status(201).json({message: 'PICU case items created'});
    } catch (error) {
        await transaction.rollback();
        return res.status(400).json({error: error.message});
    }
};

const updatePicuCaseItem = async (req, res) => {
    // const picuCaseItemId = req.params.picuCaseItemId;
    // const picuCaseItemData = req.body;
    // try {
    //     const picuCaseItem = await PicuCaseItem.findByPk(picuCaseItemId);
    //     if (!picuCaseItem) {
    //         return res.status(404).json({error: 'PICU case item not found'});
    //     }
    //     delete picuCaseItemData.picuCaseItemId;
    //     delete picuCaseItemData.picuCaseId;
    //     await picuCaseItem.update(picuCaseItemData);
    //     return res.status(204).json({message: 'PICU case item updated'});
    // } catch (error) {
    //     return res.status(400).json({error: error.message});
    // }
};

const deletePicuCaseItem = async (req, res) => {
    // const picuCaseItemId = req.params.picuCaseItemId;
    // try {
    //     const picuCaseItem = await PicuCaseItem.findByPk(picuCaseItemId);
    //     if (!picuCaseItem) {
    //         return res.status(404).json({error: 'PICU case item not found'});
    //     }
    //     await picuCaseItem.destroy();
    //     return res.status(200).json({message: 'PICU case item deleted'});
    // } catch (error) {
    //     return res.status(400).json({error: error.message});
    // }
};

const getPicuCaseItems = async (req, res) => {
    const picuCaseId = req.params.picuCaseId;
    try {
        const picuCase = await PicuCase.findByPk(picuCaseId);
        if (!picuCase) {
            return res.status(404).json({error: 'PICU case not found'});
        }
        const picuCaseItems = await PicuCaseItem.findAll({where: {picuCaseId}});
        return res.status(200).json(picuCaseItems);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPicuCaseItem = async (req, res) => {
    const picuCaseItemId = req.params.picuCaseItemId;
    try {
        const picuCaseItem = await PicuCaseItem.findByPk(picuCaseItemId);
        if (!picuCaseItem) {
            return res.status(404).json({error: 'PICU case item not found'});
        }
        return res.status(200).json(picuCaseItem);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createPicuCaseItem,
    updatePicuCaseItem,
    deletePicuCaseItem,
    getPicuCaseItems,
    getPicuCaseItem,
    createBatchPicuCaseItem
};