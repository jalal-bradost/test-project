const { SocialActivityDocuments,SocialActivity } = require("../../../models");
const { uploadSocialActivityDocumentImage } = require("../../../services/storageService");




const getAllSocialActivityDocuments = async (req, res) => {
    try {
        const {  socialActivityId } = req.params;
        const socialActivityDocuments = await SocialActivityDocuments.findAll({ where: { socialActivityId } });
        res.json(socialActivityDocuments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSocialActivityDocumentById = async (req, res) => {
    try {
        const { socialActivityId, documentId } = req.params;
        const socialActivityDocument = await SocialActivityDocuments.findOne({
            where: { socialActivityId, documentId },
        });

        if (socialActivityDocument) {
            res.json(socialActivityDocument);
        } else {
            res.status(404).json({ message: "Social activity document not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upload document handler
const createSocialActivityDocument = async (req, res) => {
    try {
        const { socialActivityId } = req.params;
        const { documentDescription, documentImage } = req.body; // Expecting base64 image

        if (!socialActivityId) {
            return res.status(400).json({ message: "Social Activity ID is required." });
        }
        const socialActivity = await SocialActivity.findOne({ where: { socialActivityId } });
        if(!socialActivity){
            return res.status(400).json({ message: "Social activity not found." });
        }
        
        if (!documentImage) {
            return res.status(400).json({ message: "No document image provided." });
        }

        // if (!documentDescription || documentDescription.trim() === "") {
        //     return res.status(400).json({ message: "Document description is required." });
        // }
        
        
        const currentDateTime = new Date().toISOString().replace(/[-:]/g, "").replace(".", "").replace("T", "_").slice(0, -5); 
        const documentName = socialActivity.socialActivityId + "_" + currentDateTime;
        // Upload image and get filename
        const filename = await uploadSocialActivityDocumentImage(documentName, documentImage);
        
        // Save the document info to the database
        const documentData = {
            socialActivityId,
            description: documentDescription,
            documentImgUrl: filename, // Store filename instead of full path
        };

        const newSocialActivityDocument = await SocialActivityDocuments.create(documentData);

        res.status(201).json({
            message: "Social activity document uploaded successfully.",
            document: newSocialActivityDocument,
        });
    } catch (error) {
        console.error("Error uploading social activity document:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const deleteSocialActivityDocument = async (req, res) => {
    try {
        const { socialActivityId, documentId } = req.params;
        const result = await SocialActivityDocuments.destroy({
            where: { socialActivityId, documentId },
        });

        if (result) {
            res.json({ message: "Social activity document deleted successfully" });
        } else {
            res.status(404).json({ message: "Social activity document not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllSocialActivityDocuments,
    getSocialActivityDocumentById,
    createSocialActivityDocument,
    deleteSocialActivityDocument,
};
