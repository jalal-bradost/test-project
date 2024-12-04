const {PicuService, PicuServiceItem} = require("../../models");

const createPicuService = async (req, res) => {
    const picuServiceData = req.body;
    try {
        const picuService = await PicuService.create(picuServiceData);
        return res.status(201).json(picuService);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updatePicuService = async (req, res) => {
    const picuServiceId = req.params.picuServiceId;
    const picuServiceData = req.body;
    try {
        const picuService = await PicuService.findByPk(picuServiceId);
        if (!picuService) {
            return res.status(404).json({error: 'PICU case not found'});
        }
        delete picuServiceData.picuServiceId;
        await picuService.update(picuServiceData);
        return res.status(204).json({message: 'PICU case updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deletePicuService = async (req, res) => {
    const picuServiceId = req.params.picuServiceId;
    try {
        const picuService = await PicuService.findByPk(picuServiceId);
        if (!picuService) {
            return res.status(404).json({error: 'PICU case not found'});
        }
        await picuService.destroy();
        return res.status(200).json({message: 'PICU case deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPicuServices = async (req, res) => {
    try {
        const picuServices = await PicuService.findAll();
        return res.status(200).json(picuServices);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPicuService = async (req, res) => {
    const picuServiceId = req.params.picuServiceId;
    try {
        const picuService = await PicuService.findByPk(picuServiceId);
        return res.status(200).json(picuService);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createPicuService,
    updatePicuService,
    deletePicuService,
    getPicuServices,
    getPicuService,
};