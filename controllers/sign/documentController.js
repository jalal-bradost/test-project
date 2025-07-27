// api/controllers/documentController.js
const { SignDocument, DocumentCounter, sequelize } = require('../../models'); // Adjust path based on your models index.js
const { uploadSignDocument, deleteSignDocument } = require('../../services/storageService'); // Adjust path
const { v4: uuidv4 } = require('uuid'); // For generating UUIDs

// Get all documents
exports.getAllDocuments = async (req, res) => {
    try {
        const documents = await SignDocument.findAll();
        res.status(200).json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
    }
};

// Create a new document
exports.createDocument = async (req, res) => {
    const { templateId, uploadedBy, fileData, fieldValues } = req.body; // fileData is base64
    if (!templateId || !uploadedBy || !fileData) {
        return res.status(400).json({ message: 'Template ID, uploader, and PDF file are required.' });
    }

    let transaction;
    try {
        transaction = await sequelize.transaction();

        // 1. Get and increment document number atomically
        const [counter, created] = await DocumentCounter.findOrCreate({
            where: { name: 'signAppDocument' },
            defaults: { currentValue: 1000 },
            transaction
        });

        const newDocumentNumber = counter.currentValue + 1;
        await counter.update({ currentValue: newDocumentNumber }, { transaction });

        // 2. Upload the PDF file
        const filenamePrefix = `doc_${newDocumentNumber}_${uuidv4()}`; // Unique prefix for filename
        const filename = await uploadSignDocument(filenamePrefix, fileData);

        // 3. Create the document record
        const newDocument = await SignDocument.create({
            id: uuidv4(), // Explicitly generate UUID for the document
            templateId,
            uploadedBy,
            status: 'pending', // Initial status
            pdfUrl: filename, // Store the generated filename
            fieldValues: { ...fieldValues, documentNumber: newDocumentNumber }, // Add auto-generated number to fieldValues
            signatures: [], // No signatures initially
            documentNumber: newDocumentNumber,
        }, { transaction });

        await transaction.commit();
        res.status(201).json(newDocument);
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Error creating document:', error);
        res.status(500).json({ message: 'Failed to create document', error: error.message });
    }
};

// Sign a document
exports.signDocument = async (req, res) => {
    const { id } = req.params;
    const { fieldId, signature } = req.body; // signature object: { userId, fieldId, signedAt, signatureText, signerRole }

    if (!fieldId || !signature) {
        return res.status(400).json({ message: 'Field ID and signature data are required.' });
    }

    try {
        const document = await SignDocument.findByPk(id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Check if the field is already signed by this user
        const alreadySigned = document.signatures.some(
            s => s.userId === signature.userId && s.fieldId === fieldId
        );
        if (alreadySigned) {
            return res.status(409).json({ message: 'This field has already been signed by this user.' });
        }

        // Add the new signature
        const updatedSignatures = [...document.signatures, signature];

        // Update document status based on signatures (simplified logic)
        // You would implement more complex workflow logic here based on your roles
        let newStatus = document.status;
        // Fetch the template to determine required signatures for status updates
        const template = await db.SignTemplate.findByPk(document.templateId);
        if (!template) {
            console.warn(`Template with ID ${document.templateId} not found for document ${document.id}. Status update might be incomplete.`);
            // Continue without template-specific status logic
        } else {
            const requiredSignerRoles = new Set(template.fields
                .filter(f => f.type === 'signature' && f.signerRole)
                .map(f => f.signerRole));

            const signedRoles = new Set(updatedSignatures.map(s => s.signerRole));

            // Check if all required roles have signed
            const allRequiredSigned = Array.from(requiredSignerRoles).every(role => signedRoles.has(role));

            if (allRequiredSigned) {
                newStatus = 'completed';
            } else if (signature.signerRole === 'hrManager') {
                newStatus = 'signed_by_hr';
            } else if (signature.signerRole === 'generalManager') {
                newStatus = 'signed_by_gm';
            } else if (signature.signerRole === 'teamLeader' && !requiredSignerRoles.has('hrManager') && !requiredSignerRoles.has('generalManager')) {
                // If only team leader signature is required, and they sign, it's completed
                newStatus = 'completed';
            } else if (signature.signerRole === 'teamLeader') {
                // If team leader signs and other roles are required, it moves to review
                newStatus = 'in_review';
            }
        }


        await document.update({
            signatures: updatedSignatures,
            status: newStatus,
        });

        res.status(200).json(document);
    } catch (error) {
        console.error('Error signing document:', error);
        res.status(500).json({ message: 'Failed to sign document', error: error.message });
    }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
    const { id } = req.params;
    try {
        const document = await SignDocument.findByPk(id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Delete the associated PDF file
        if (document.pdfUrl) {
            await deleteSignDocument(document.pdfUrl);
        }

        await document.destroy();
        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Failed to delete document', error: error.message });
    }
};
