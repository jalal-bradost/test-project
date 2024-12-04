const path = require("path");
const fs = require("fs");
const IMAGE_DIR = path.join(__dirname, '../', 'images', 'employees')
const TASK_CHAT_DIR = path.join(__dirname, '../', 'audios', 'task-chats')
const ORDER_CHAT_DIR = path.join(__dirname, '../', 'files', 'order-chats')

const uploadEmployeeImage = async (name, image) => {
    const fileExtension = image.split(';')[0].split('/')[1]
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "")
    const filename = `${name}.${fileExtension}`
    const filepath = path.join(IMAGE_DIR, filename)
    try {
        fs.writeFileSync(filepath, base64Data, 'base64')
        console.log('Image uploaded successfully', filename)
        return filename
    } catch (e) {
        throw new Error('Error in uploading image')
    }
}

const uploadTaskChatAudio = async (name, image) => {
    const fileExtension = image.split(';')[0].split('/')[1]
    const base64Data = image.replace(/^data:audio\/\w+;(?:codecs=[^;]+;)?base64,/, "")
    const filename = `${name}.${fileExtension}`
    const filepath = path.join(TASK_CHAT_DIR, filename)
    try {
        fs.writeFileSync(filepath, base64Data, 'base64')
        return filename
    } catch (e) {
        throw new Error('Error in uploading audio')
    }
}

const uploadTaskChatFile = async (name, file) => {
    const fileExtension = file.split(';')[0].split('/')[1]
    const base64Data = file.replace(/^data:audio\/\w+;(?:codecs=[^;]+;)?base64,/, "")
    const filename = `${name}.${fileExtension}`
    const filepath = path.join(TASK_CHAT_DIR, filename)
    try {
        fs.writeFileSync(filepath, base64Data, 'base64')
        return filename
    } catch (e) {
        throw new Error('Error in uploading file')
    }
}

const uploadOrderChatAudio = async (name, image) => {
    const fileExtension = image.split(';')[0].split('/')[1]
    const base64Data = image.replace(/^data:audio\/\w+;(?:codecs=[^;]+;)?base64,/, "")
    const filename = `${name}.${fileExtension}`
    const filepath = path.join(ORDER_CHAT_DIR, filename)
    try {
        fs.writeFileSync(filepath, base64Data, 'base64')
        return filename
    } catch (e) {
        throw new Error('Error in uploading audio')
    }
}

const uploadOrderChatFile = async (name, file) => {
    const fileExtension = file.split(';')[0].split('/')[1]
    const base64Data = file.replace(/^data:audio\/\w+;(?:codecs=[^;]+;)?base64,/, "")
    const filename = `${name}.${fileExtension}`
    const filepath = path.join(ORDER_CHAT_DIR, filename)
    try {
        fs.writeFileSync(filepath, base64Data, 'base64')
        return filename
    } catch (e) {
        throw new Error('Error in uploading file')
    }
}

module.exports = {
    uploadEmployeeImage, uploadTaskChatAudio, uploadTaskChatFile, uploadOrderChatAudio, uploadOrderChatFile
}