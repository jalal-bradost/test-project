const {OrderChat, OrderChatSeen, User} = require("../models");
const {uploadOrderChatAudio, uploadOrderChatFile} = require("../services/storageService");
const {Op} = require("sequelize");

const createOrderChat = async (req, res) => {
    const orderId = req.params.orderId;
    const chatData = req.body;
    try {
        const chat = await OrderChat.create({orderId, ...chatData, userId: req.user.userId});
        await OrderChatSeen.create({chatId: chat.chatId, userId: req.user.userId});
        return res.status(201).json(chat.get());
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const createAudioOrderChat = async (req, res) => {
    const orderId = req.params.orderId;
    const {file} = req.body;
    try {
        const uuid = generateUUID();
        const filename = await uploadOrderChatAudio(uuid, file);
        const chat = await OrderChat.create({orderId, content: `audio={${filename}}`, userId: req.user.userId});
        await OrderChatSeen.create({chatId: chat.chatId, userId: req.user.userId});
        return res.status(201).json(chat.get());
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const createFileOrderChat = async (req, res) => {
    const orderId = req.params.orderId;
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    try {
        const filename = req.file.filename;
        const chat = await OrderChat.create({orderId, content: `file={${filename}}`, userId: req.user.userId});
        await OrderChatSeen.create({chatId: chat.chatId, userId: req.user.userId});
        return res.status(201).json(chat.get());
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
};

const getOrderChats = async (req, res) => {
    const orderId = req.params.orderId;
    try {
        const chats = await OrderChat.findAll({
            where: {orderId},
            include: [
                {model: User, as: "user"},
                {model: OrderChatSeen, as: "seenBy"}
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
    const orderId = req.params.orderId;
    const {chatIds} = req.body;
    try {
        const existingSeenChats = await OrderChatSeen.findAll({
            where: {
                chatId: {[Op.in]: chatIds},
                userId: req.user.userId
            }
        });

        const existingSeenChatIds = existingSeenChats.map(chat => chat.chatId);
        const newSeenChatIds = chatIds.filter(id => !existingSeenChatIds.includes(id));

        if (newSeenChatIds.length > 0) {
            await OrderChatSeen.bulkCreate(
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

module.exports = {createOrderChat, getOrderChats, createAudioOrderChat, createFileOrderChat, markChatsAsSeen};