const {AnesthesiaCaseItem, AnesthesiaCase, sequelize, Product, ProductStorage} = require("../../models");

const systemStorageId = 8;

const createAnesthesiaCaseItem = async (req, res) => {
    const anesthesiaCaseId = req.params.anesthesiaCaseId;
    const anesthesiaCaseItemData = req.body;
    try {
        const anesthesiaCaseItem = await AnesthesiaCaseItem.create({...anesthesiaCaseItemData, anesthesiaCaseId});
        return res.status(201).json(anesthesiaCaseItem);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const createBatchAnesthesiaCaseItem = async (req, res) => {
    const anesthesiaCaseId = req.params.anesthesiaCaseId;
    const anesthesiaCaseItems = req.body;
    const transaction = await sequelize.transaction();
    try {
        for (const anesthesiaCaseItemData of anesthesiaCaseItems) {
            let quantity = anesthesiaCaseItemData.quantity;
            const productsInStorage = await ProductStorage.findAll({
                where: {
                    storageId: systemStorageId,
                    barcode: anesthesiaCaseItemData.barcode
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
            await AnesthesiaCaseItem.create({...anesthesiaCaseItemData, anesthesiaCaseId}, {transaction});
        }
        await transaction.commit();
        return res.status(201).json({message: 'Anesthesia case items created'});
    } catch (error) {
        await transaction.rollback();
        return res.status(400).json({error: error.message});
    }
};

const updateAnesthesiaCaseItem = async (req, res) => {
    // const anesthesiaCaseItemId = req.params.anesthesiaCaseItemId;
    // const anesthesiaCaseItemData = req.body;
    // try {
    //     const anesthesiaCaseItem = await AnesthesiaCaseItem.findByPk(anesthesiaCaseItemId);
    //     if (!anesthesiaCaseItem) {
    //         return res.status(404).json({error: 'Anesthesia case item not found'});
    //     }
    //     delete anesthesiaCaseItemData.anesthesiaCaseItemId;
    //     delete anesthesiaCaseItemData.anesthesiaCaseId;
    //     await anesthesiaCaseItem.update(anesthesiaCaseItemData);
    //     return res.status(204).json({message: 'Anesthesia case item updated'});
    // } catch (error) {
    //     return res.status(400).json({error: error.message});
    // }
};

const deleteAnesthesiaCaseItem = async (req, res) => {
    // const anesthesiaCaseItemId = req.params.anesthesiaCaseItemId;
    // try {
    //     const anesthesiaCaseItem = await AnesthesiaCaseItem.findByPk(anesthesiaCaseItemId);
    //     if (!anesthesiaCaseItem) {
    //         return res.status(404).json({error: 'Anesthesia case item not found'});
    //     }
    //     await anesthesiaCaseItem.destroy();
    //     return res.status(200).json({message: 'Anesthesia case item deleted'});
    // } catch (error) {
    //     return res.status(400).json({error: error.message});
    // }
};

const getAnesthesiaCaseItems = async (req, res) => {
    const anesthesiaCaseId = req.params.anesthesiaCaseId;
    try {
        const anesthesiaCase = await AnesthesiaCase.findByPk(anesthesiaCaseId);
        if (!anesthesiaCase) {
            return res.status(404).json({error: 'Anesthesia case not found'});
        }
        const anesthesiaCaseItems = await AnesthesiaCaseItem.findAll({where: {anesthesiaCaseId}});
        return res.status(200).json(anesthesiaCaseItems);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getAnesthesiaCaseItem = async (req, res) => {
    const anesthesiaCaseItemId = req.params.anesthesiaCaseItemId;
    try {
        const anesthesiaCaseItem = await AnesthesiaCaseItem.findByPk(anesthesiaCaseItemId);
        if (!anesthesiaCaseItem) {
            return res.status(404).json({error: 'Anesthesia case item not found'});
        }
        return res.status(200).json(anesthesiaCaseItem);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createAnesthesiaCaseItem,
    updateAnesthesiaCaseItem,
    deleteAnesthesiaCaseItem,
    getAnesthesiaCaseItems,
    getAnesthesiaCaseItem,
    createBatchAnesthesiaCaseItem
};