const {ScrubNurseCaseItem, ScrubNurseCase, sequelize, Product, ProductStorage} = require("../../models");

const systemStorageId = 8;

const createScrubNurseCaseItem = async (req, res) => {
    const scrubNurseCaseId = req.params.scrubNurseCaseId;
    const scrubNurseCaseItemData = req.body;
    try {
        const scrubNurseCaseItem = await ScrubNurseCaseItem.create({...scrubNurseCaseItemData, scrubNurseCaseId});
        return res.status(201).json(scrubNurseCaseItem);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const createBatchScrubNurseCaseItem = async (req, res) => {
    const scrubNurseCaseId = req.params.scrubNurseCaseId;
    const scrubNurseCaseItems = req.body;
    const transaction = await sequelize.transaction();
    try {
        for (const scrubNurseCaseItemData of scrubNurseCaseItems) {
            let quantity = scrubNurseCaseItemData.quantity;
            const productsInStorage = await ProductStorage.findAll({
                where: {
                    storageId: systemStorageId,
                    barcode: scrubNurseCaseItemData.barcode
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
            await ScrubNurseCaseItem.create({...scrubNurseCaseItemData, scrubNurseCaseId}, {transaction});
        }
        await transaction.commit();
        return res.status(201).json({message: 'ScrubNurse case items created'});
    } catch (error) {
        await transaction.rollback();
        return res.status(400).json({error: error.message});
    }
};

const updateScrubNurseCaseItem = async (req, res) => {
    // const scrubNurseCaseItemId = req.params.scrubNurseCaseItemId;
    // const scrubNurseCaseItemData = req.body;
    // try {
    //     const scrubNurseCaseItem = await ScrubNurseCaseItem.findByPk(scrubNurseCaseItemId);
    //     if (!scrubNurseCaseItem) {
    //         return res.status(404).json({error: 'ScrubNurse case item not found'});
    //     }
    //     delete scrubNurseCaseItemData.scrubNurseCaseItemId;
    //     delete scrubNurseCaseItemData.scrubNurseCaseId;
    //     await scrubNurseCaseItem.update(scrubNurseCaseItemData);
    //     return res.status(204).json({message: 'ScrubNurse case item updated'});
    // } catch (error) {
    //     return res.status(400).json({error: error.message});
    // }
};

const deleteScrubNurseCaseItem = async (req, res) => {
    // const scrubNurseCaseItemId = req.params.scrubNurseCaseItemId;
    // try {
    //     const scrubNurseCaseItem = await ScrubNurseCaseItem.findByPk(scrubNurseCaseItemId);
    //     if (!scrubNurseCaseItem) {
    //         return res.status(404).json({error: 'ScrubNurse case item not found'});
    //     }
    //     await scrubNurseCaseItem.destroy();
    //     return res.status(200).json({message: 'ScrubNurse case item deleted'});
    // } catch (error) {
    //     return res.status(400).json({error: error.message});
    // }
};

const getScrubNurseCaseItems = async (req, res) => {
    const scrubNurseCaseId = req.params.scrubNurseCaseId;
    try {
        const scrubNurseCase = await ScrubNurseCase.findByPk(scrubNurseCaseId);
        if (!scrubNurseCase) {
            return res.status(404).json({error: 'ScrubNurse case not found'});
        }
        const scrubNurseCaseItems = await ScrubNurseCaseItem.findAll({where: {scrubNurseCaseId}});
        return res.status(200).json(scrubNurseCaseItems);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getScrubNurseCaseItem = async (req, res) => {
    const scrubNurseCaseItemId = req.params.scrubNurseCaseItemId;
    try {
        const scrubNurseCaseItem = await ScrubNurseCaseItem.findByPk(scrubNurseCaseItemId);
        if (!scrubNurseCaseItem) {
            return res.status(404).json({error: 'ScrubNurse case item not found'});
        }
        return res.status(200).json(scrubNurseCaseItem);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createScrubNurseCaseItem,
    updateScrubNurseCaseItem,
    deleteScrubNurseCaseItem,
    getScrubNurseCaseItems,
    getScrubNurseCaseItem,
    createBatchScrubNurseCaseItem
};