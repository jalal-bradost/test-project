const {PicuCaseTime} = require("../../models");

const createPicuCaseTime = async (req, res) => {
    const picuCaseId = req.params.picuCaseId;
    const picuCaseTimeData = req.body;
    try {
        const picuCaseTime = await PicuCaseTime.create({...picuCaseTimeData, picuCaseId});
        return res.status(201).json(picuCaseTime);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updatePicuCaseTime = async (req, res) => {
    const picuCaseTimeId = req.params.picuCaseTimeId;
    const picuCaseTimeData = req.body;
    try {
        const picuCaseTime = await PicuCaseTime.findByPk(picuCaseTimeId);
        if (!picuCaseTime) {
            return res.status(404).json({error: 'PICU case not found'});
        }
        delete picuCaseTimeData.picuCaseTimeId;
        delete picuCaseTimeData.picuCaseId;
        await picuCaseTime.update(picuCaseTimeData);
        return res.status(204).json({message: 'PICU case updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deletePicuCaseTime = async (req, res) => {
    const picuCaseTimeId = req.params.picuCaseTimeId;
    try {
        const picuCaseTime = await PicuCaseTime.findByPk(picuCaseTimeId);
        if (!picuCaseTime) {
            return res.status(404).json({error: 'PICU case not found'});
        }
        await picuCaseTime.destroy();
        return res.status(200).json({message: 'PICU case deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPicuCaseTimes = async (req, res) => {
    try {
        const picuCaseTimes = await PicuCaseTime.findAll();
        return res.status(200).json(picuCaseTimes);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPicuCaseTime = async (req, res) => {
    const picuCaseTimeId = req.params.picuCaseTimeId;
    try {
        const picuCaseTime = await PicuCaseTime.findByPk(picuCaseTimeId);
        return res.status(200).json(picuCaseTime);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createPicuCaseTime,
    updatePicuCaseTime,
    deletePicuCaseTime,
    getPicuCaseTimes,
    getPicuCaseTime,
};