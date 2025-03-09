const { PatientCRMDocuments,PatientCRM } = require("../../../models");
const { uploadPatientDocumentImage } = require("../../../services/storageService");




const getAllPatientDocuments = async (req, res) => {
    try {
        const { patientId } = req.params;
        const patientDocuments = await PatientCRMDocuments.findAll({ where: { patientId } });
        res.json(patientDocuments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPatientDocumentById = async (req, res) => {
    try {
        const { patientId, documentId } = req.params;
        const patientDocument = await PatientCRMDocuments.findOne({
            where: { patientId, documentId },
        });

        if (patientDocument) {
            res.json(patientDocument);
        } else {
            res.status(404).json({ message: "Patient document not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upload document handler
const createPatientDocument = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { documentDescription, documentImage } = req.body; // Expecting base64 image

        if (!patientId) {
            return res.status(400).json({ message: "Patient ID is required." });
        }
        const patient = await PatientCRM.findOne({ where: { patientId } });
        if(!patient){
            return res.status(400).json({ message: "Patient not found." });
        }
        
        if (!documentImage) {
            return res.status(400).json({ message: "No document image provided." });
        }

        if (!documentDescription || documentDescription.trim() === "") {
            return res.status(400).json({ message: "Document description is required." });
        }
        
        
        const currentDateTime = new Date().toISOString().replace(/[-:]/g, "").replace(".", "").replace("T", "_").slice(0, -5); 
        const documentName = patient.fullname + "_" + currentDateTime;
        // Upload image and get filename
        const filename = await uploadPatientDocumentImage(documentName, documentImage);
        
        // Save the document info to the database
        const documentData = {
            patientId,
            description: documentDescription,
            documentImgUrl: filename, // Store filename instead of full path
        };

        const newPatientDocument = await PatientCRMDocuments.create(documentData);

        res.status(201).json({
            message: "Patient document uploaded successfully.",
            document: newPatientDocument,
        });
    } catch (error) {
        console.error("Error uploading patient document:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const deletePatientDocument = async (req, res) => {
    try {
        const { patientId, documentId } = req.params;
        const result = await PatientCRMDocuments.destroy({
            where: { patientId, documentId },
        });

        if (result) {
            res.json({ message: "Patient document deleted successfully" });
        } else {
            res.status(404).json({ message: "Patient document not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllPatientDocuments,
    getPatientDocumentById,
    createPatientDocument,
    deletePatientDocument,
};
