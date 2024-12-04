const {EmployeeTaskChat, EmployeeTaskChatSeen, User} = require("../../../models");
const {uploadTaskChatAudio, uploadTaskChatFile} = require("../../../services/storageService");
const {Op} = require("sequelize");

const createTaskChat = async (req, res) => {
    const taskId = req.params.taskId;
    const chatData = req.body;
    try {
        const chat = await EmployeeTaskChat.create({taskId, ...chatData, userId: req.user.userId});
        await EmployeeTaskChatSeen.create({chatId: chat.chatId, userId: req.user.userId});
        return res.status(201).json(chat.get());
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const createAudioTaskChat = async (req, res) => {
    const taskId = req.params.taskId;
    const {file} = req.body;
    try {
        const uuid = generateUUID();
        const filename = await uploadTaskChatAudio(uuid, file);
        const chat = await EmployeeTaskChat.create({taskId, content: `audio={${filename}}`, userId: req.user.userId});
        await EmployeeTaskChatSeen.create({chatId: chat.chatId, userId: req.user.userId});
        return res.status(201).json(chat.get());
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const createFileTaskChat = async (req, res) => {
    const taskId = req.params.taskId;
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    try {
        const filename = req.file.filename;
        const chat = await EmployeeTaskChat.create({taskId, content: `file={${filename}}`, userId: req.user.userId});
        await EmployeeTaskChatSeen.create({chatId: chat.chatId, userId: req.user.userId});
        return res.status(201).json(chat.get());
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getTaskChats = async (req, res) => {
    const taskId = req.params.taskId;
    try {
        const chats = await EmployeeTaskChat.findAll({
            where: {taskId},
            include: [
                {model: User, as: "user"},
                {model: EmployeeTaskChatSeen, as: "seenBy"}
            ]
        });
        const formattedChats = chats.map(chat => ({
            ...chat.get(),
            seen: chat.seenBy.some(seen => seen.userId === req.user.userId)
        }));
        return res.status(200).json(formattedChats.sort((a, b) => a.chatId - b.chatId));
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const markChatsAsSeen = async (req, res) => {
    const taskId = req.params.taskId;
    const {chatIds} = req.body;
    try {
        const existingSeenChats = await EmployeeTaskChatSeen.findAll({
            where: {
                chatId: {[Op.in]: chatIds},
                userId: req.user.userId
            }
        });

        const existingSeenChatIds = existingSeenChats.map(chat => chat.chatId);
        const newSeenChatIds = chatIds.filter(id => !existingSeenChatIds.includes(id));

        if (newSeenChatIds.length > 0) {
            await EmployeeTaskChatSeen.bulkCreate(
                newSeenChatIds.map(chatId => ({chatId, userId: req.user.userId}))
            );
        }

        return res.status(200).json({message: "Messages marked as seen"});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const generateUUID = () => {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

module.exports = {createTaskChat, getTaskChats, createAudioTaskChat, createFileTaskChat, markChatsAsSeen};