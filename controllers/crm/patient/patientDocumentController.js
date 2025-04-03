const { PatientCRMDocuments, PatientCRM } = require("../../../models");
const { uploadPatientDocument } = require("../../../services/storageService");

const fs = require("fs").promises;
const path = require("path");

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
        const { documentDescription, documentFiles } = req.body; // Now expecting an array of generic Base64 files

        if (!patientId) {
            return res.status(400).json({ message: "Patient ID is required." });
        }
        const patient = await PatientCRM.findOne({ where: { patientId } });
        if (!patient) {
            return res.status(400).json({ message: "Patient not found." });
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
        const documentNamePrefix = patient.fullname + "_" + currentDateTime;
        
        // Process each file and create a database entry for each
        const createdDocuments = [];
        for (let i = 0; i < documentFiles.length; i++) {
            const base64File = documentFiles[i];
            // Append an index to ensure unique filenames for each file
            const fileName = documentNamePrefix + "_" + (i + 1);
            const filename = await uploadPatientDocument(fileName, base64File);
            
            // Save the document info to the database
            const documentData = {
                patientId,
                description: documentDescription,
                documentImgUrl: filename, // Store filename instead of full path
            };

            const newPatientDocument = await PatientCRMDocuments.create(documentData);
            createdDocuments.push(newPatientDocument);
        }

        res.status(201).json({
            message: "Patient documents uploaded successfully.",
            documents: createdDocuments,
        });
    } catch (error) {
        console.error("Error uploading patient document:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const deletePatientDocument = async (req, res) => {
    try {
      const { patientId, documentId } = req.params;
      // Retrieve the document record first
      const doc = await PatientCRMDocuments.findOne({
        where: { patientId, documentId },
      }); 
  
      if (!doc) {
        return res.status(404).json({ message: "Patient document not found" });
      }
  
      // Build the full file path. Adjust the relative path as needed.
      const filePath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "images",
        "patient-documents",
        doc.documentImgUrl
      );
  
      try {
        await fs.unlink(filePath);
      } catch (fileError) {
        console.error("Error deleting file:", fileError);
        // Optionally, you can decide to fail the request or simply log the error.
      }
  
      // Delete the record from the database
      await PatientCRMDocuments.destroy({
        where: { patientId, documentId },
      });
  
      res.json({ message: "Patient document deleted successfully" });
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
