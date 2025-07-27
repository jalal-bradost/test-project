// api/routes/signRoutes.js
const router = require("../../config/express");
const templateController = require('../../controllers/sign/templateController');
const documentController = require('../../controllers/sign/documentController');
const { uploadSignDocument } = require('../../services/storageService'); // For direct PDF upload



// --- PDF Upload Route (for templates and documents) ---
// This route is used by the frontend to send Base64 PDF data to the backend for storage.
router.post('/sign/upload-pdf',  async (req, res) => {
    const { filenamePrefix, fileData } = req.body;
    if (!filenamePrefix || !fileData) {
        return res.status(400).json({ message: 'Filename prefix and file data are required.' });
    }
    try {
        const filename = await uploadSignDocument(filenamePrefix, fileData);
        res.status(200).json({ filename });
    } catch (error) {
        console.error('Error uploading PDF:', error);
        res.status(500).json({ message: 'Failed to upload PDF', error: error.message });
    }
});


// --- Template Routes ---
// GET: Fetch all document templates
router.get('/sign/templates',  templateController.getAllTemplates);
// POST: Create a new document template (requires admin permission 0)
router.post('/sign/templates',   templateController.createTemplate);
// PUT: Update an existing document template by ID (requires admin permission 0)
router.put('/sign/templates/:id',  templateController.updateTemplate);
// DELETE: Delete a document template by ID (requires admin permission 0)
router.delete('/sign/templates/:id',templateController.deleteTemplate);

// --- Document Routes ---
// GET: Fetch all created document instances
router.get('/sign/documents', documentController.getAllDocuments);
// POST: Create a new document instance from a template (requires team leader permission 5)
router.post('/sign/documents',documentController.createDocument);
// PUT: Sign a specific field on a document by ID
router.put('/sign/documents/:id/sign', documentController.signDocument);
// DELETE: Delete a document instance by ID (requires admin permission 0)
router.delete('/sign/documents/:id', documentController.deleteDocument);

module.exports = router;
