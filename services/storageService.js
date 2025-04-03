const path = require("path");
const fs = require("fs");
const IMAGE_DIR = path.join(__dirname, '../', 'images', 'employees')
const TASK_CHAT_DIR = path.join(__dirname, '../', 'audios', 'task-chats')
const ORDER_CHAT_DIR = path.join(__dirname, '../', 'files', 'order-chats')
const PATIENT_DOC_DIR = path.join(__dirname, '../', 'images', 'patient-documents');
const SOCIAL_ACTIVITY_DOC_DIR = path.join(__dirname, '../', 'images', 'social-activity-documents');

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

// Function to upload a patient's document image (like a file upload in base64 format)
const uploadPatientDocument = async (name, fileData) => {
    // Match the Data URL pattern to extract MIME type and base64 content
    const matches = fileData.match(/^data:(\w+\/[\w-+.]+);base64,(.+)$/);
    if (!matches) {
        throw new Error('Invalid file data provided.');
    }
    const mimeType = matches[1]; // e.g. "image/png", "application/pdf", "video/mp4", etc.
    const base64Content = matches[2];
    
    // Determine file extension from MIME type
    let extension = mimeType.split('/')[1];
    // Optional: Handle special cases for known MIME types if necessary.
    // For instance, you might want to convert "jpeg" to "jpg", etc.
    if (extension === "jpeg") {
        extension = "jpg";
    }
    
    const filename = `${name}.${extension}`;
    const filepath = path.join(PATIENT_DOC_DIR, filename);
    
    try {
        fs.writeFileSync(filepath, base64Content, 'base64');
        console.log('Patient document uploaded successfully:', filename);
        return filename;
    } catch (e) {
        throw new Error('Error in uploading patient document file');
    }
};


// Function to upload a patient's document image (like a file upload in base64 format)
const uploadSocialActivityDocumentImage = async (name, image) => {
    const fileExtension = image.split(';')[0].split('/')[1]; // Extract file extension from MIME type
    const base64Data = image.replace(/^data:image\/\w+;base64,/, ""); // Remove the base64 header
    const filename = `${name}.${fileExtension}`; // Use the documents's name and extension as the filename
    const filepath = path.join(SOCIAL_ACTIVITY_DOC_DIR, filename); // Define the file path in the directory
    
    try {
        // Write the base64 image data to a file in the social activity document directory
        fs.writeFileSync(filepath, base64Data, 'base64');
        console.log('Document image uploaded successfully:', filename);
        return filename; // Return the filename after successful upload
    } catch (e) {
        throw new Error('Error in uploading social activity document image');
    }
};


module.exports = {
    uploadEmployeeImage, uploadTaskChatAudio, uploadTaskChatFile, uploadOrderChatAudio, uploadOrderChatFile, uploadPatientDocument, uploadSocialActivityDocumentImage
}