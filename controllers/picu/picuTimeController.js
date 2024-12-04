const {PicuTime} = require("../../models");

const createPicuTime = async (req, res) => {
    const picuTimeData = req.body;
    try {
        const picuTime = await PicuTime.create(picuTimeData);
        return res.status(201).json(picuTime);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const updatePicuTime = async (req, res) => {
    const picuTimeId = req.params.picuTimeId;
    const picuTimeData = req.body;
    try {
        const picuTime = await PicuTime.findByPk(picuTimeId);
        if (!picuTime) {
            return res.status(404).json({error: 'PICU case not found'});
        }
        delete picuTimeData.picuTimeId;
        await picuTime.update(picuTimeData);
        return res.status(204).json({message: 'PICU case updated'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const deletePicuTime = async (req, res) => {
    const picuTimeId = req.params.picuTimeId;
    try {
        const picuTime = await PicuTime.findByPk(picuTimeId);
        if (!picuTime) {
            return res.status(404).json({error: 'PICU case not found'});
        }
        await picuTime.destroy();
        return res.status(200).json({message: 'PICU case deleted'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPicuTimes = async (req, res) => {
    try {
        const picuTimes = await PicuTime.findAll();
        return res.status(200).json(picuTimes);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getPicuTime = async (req, res) => {
    const picuTimeId = req.params.picuTimeId;
    try {
        const picuTime = await PicuTime.findByPk(picuTimeId);
        return res.status(200).json(picuTime);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

module.exports = {
    createPicuTime,
    updatePicuTime,
    deletePicuTime,
    getPicuTimes,
    getPicuTime,
};