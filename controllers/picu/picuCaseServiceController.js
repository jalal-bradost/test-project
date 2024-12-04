const {PicuCaseService} = require("../../models");

const createPicuCaseService = async (req, res) => {
    const picuCaseId = req.params.picuCaseId;
    const picuCaseServiceData = req.body;
    try {
        const picuCaseService = await PicuCaseService.create({...picuCaseServiceData, picuCaseId});
        return res.status(201).json(picuCaseService);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updatePicuCaseService = async (req, res) => {
    const picuCaseServiceId = req.params.picuCaseServiceId;
    const picuCaseServiceData = req.body;
    try {
        const picuCaseService = await PicuCaseService.findByPk(picuCaseServiceId);
        if (!picuCaseService) {
            return res.status(404).json({error: 'PICU case not found'});
        }
        delete picuCaseServiceData.picuCaseServiceId;
        delete picuCaseServiceData.picuCaseId;
        await picuCaseService.update(picuCaseServiceData);
        return res.status(204).json({message: 'PICU case updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deletePicuCaseService = async (req, res) => {
    const picuCaseServiceId = req.params.picuCaseServiceId;
    try {
        const picuCaseService = await PicuCaseService.findByPk(picuCaseServiceId);
        if (!picuCaseService) {
            return res.status(404).json({error: 'PICU case not found'});
        }
        await picuCaseService.destroy();
        return res.status(200).json({message: 'PICU case deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPicuCaseServices = async (req, res) => {
    try {
        const picuCaseServices = await PicuCaseService.findAll();
        return res.status(200).json(picuCaseServices);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPicuCaseService = async (req, res) => {
    const picuCaseServiceId = req.params.picuCaseServiceId;
    try {
        const picuCaseService = await PicuCaseService.findByPk(picuCaseServiceId);
        return res.status(200).json(picuCaseService);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createPicuCaseService,
    updatePicuCaseService,
    deletePicuCaseService,
    getPicuCaseServices,
    getPicuCaseService,
};