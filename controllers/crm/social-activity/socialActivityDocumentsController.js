const { SocialActivityDocuments,CrmActivityLog, SocialActivity } = require("../../../models");
const { uploadSocialActivityDocumentImage } = require("../../../services/storageService");
const fs = require("fs").promises;
const path = require("path");

const getAllSocialActivityDocuments = async (req, res) => {
    try {
        const { socialActivityId } = req.params;
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

// Upload document handler (updated to mirror patient document logic)
const createSocialActivityDocument = async (req, res) => {
    try {
        const { socialActivityId } = req.params;
        const { documentDescription, documentFiles } = req.body; // Expecting an array of generic Base64 files

        if (!socialActivityId) {
            return res.status(400).json({ message: "Social Activity ID is required." });
        }
        const socialActivity = await SocialActivity.findOne({ where: { socialActivityId } });
        if (!socialActivity) {
            return res.status(400).json({ message: "Social activity not found." });
        }
        
        if (!documentFiles || !Array.isArray(documentFiles) || documentFiles.length === 0) {
            return res.status(400).json({ message: "No document files provided." });
        }
        
        // Generate a common prefix for the filenames
        const currentDateTime = new Date().toISOString()
            .replace(/[-:]/g, "")
            .replace(".", "")
            .replace("T", "_")
            .slice(0, -5);
        const documentNamePrefix = socialActivity.socialActivityId + "_" + currentDateTime;
        
        // Process each file and create a database entry for each
        const createdDocuments = [];
        for (let i = 0; i < documentFiles.length; i++) {
            const base64File = documentFiles[i];
            // Append an index to ensure unique filenames for each file
            const fileName = documentNamePrefix + "_" + (i + 1);
            const filename = await uploadSocialActivityDocumentImage(fileName, base64File);
            
            // Save the document info to the database
            const documentData = {
                socialActivityId,
                description: documentDescription,
                documentImgUrl: filename, // Store filename instead of full path
            };

            const newSocialActivityDocument = await SocialActivityDocuments.create(documentData);
            createdDocuments.push(newSocialActivityDocument);
        }

        // Log the activity
        const createdBy = req.user.userId;
        await CrmActivityLog.create({
            stage: "Social Activity Document Created",
            createdBy,
            objectType: "SocialActivityDocument",
            objectId: socialActivityId,
            note: `Social Activity document created for activity ID: ${socialActivityId}, description: ${documentDescription}`,
        });

        res.status(201).json({
            message: "Social activity documents uploaded successfully.",
            documents: createdDocuments,
        });
    } catch (error) {
        console.error("Error uploading social activity document:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const deleteSocialActivityDocument = async (req, res) => {
    try {
        const { socialActivityId, documentId } = req.params;
        // Retrieve the document record first
        const doc = await SocialActivityDocuments.findOne({
            where: { socialActivityId, documentId },
        }); 

        if (!doc) {
            return res.status(404).json({ message: "Social activity document not found" });
        }
  
        // Build the full file path. Adjust the relative path as needed.
        const filePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "images",
            "social-activity-documents",
            doc.documentImgUrl
        );
  
        try {
            await fs.unlink(filePath);
        } catch (fileError) {
            console.error("Error deleting file:", fileError);
            // Optionally, you can decide to fail the request or simply log the error.
        }
  
        // Delete the record from the database
        await SocialActivityDocuments.destroy({
            where: { socialActivityId, documentId },
        });

        // Log the activity
        const createdBy = req.user.userId;
        await CrmActivityLog.create({
            stage: "Social Activity Document Deleted",
            createdBy,
            objectType: "SocialActivityDocument",
            objectId: socialActivityId,
            note: `Social Activity document deleted for activity ID: ${socialActivityId}, document ID: ${documentId}`,
        });
  
        res.json({ message: "Social activity document deleted successfully" });
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
