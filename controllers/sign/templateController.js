// api/controllers/templateController.js
const { SignTemplate } = require('../../models'); // Adjust path based on your models index.js
const { uploadSignDocument, deleteSignDocument } = require('../../services/storageService'); // Adjust path

// Get all templates
exports.getAllTemplates = async (req, res) => {
    try {
        const templates = await SignTemplate.findAll();
        res.status(200).json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ message: 'Failed to fetch templates', error: error.message });
    }
};

// Create a new template
exports.createTemplate = async (req, res) => {
    const { name, pdfUrl, fields } = req.body; // fileData is base64
    if (!name || !pdfUrl || !fields) {
        return res.status(400).json({ message: 'Template name, PDF file, and fields are required.' });
    }

    try {

        const newTemplate = await SignTemplate.create({
            name,
            pdfUrl: pdfUrl, // Store the generated filename
            fields,
        });
        res.status(201).json(newTemplate);
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ message: 'Failed to create template', error: error.message });
    }
};

// Update an existing template
exports.updateTemplate = async (req, res) => {
    const { id } = req.params;
    const { name, fileData, fields } = req.body;

    try {
        const template = await SignTemplate.findByPk(id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found.' });
        }

        let updatedPdfUrl = template.pdfUrl;
        // If a new fileData is provided, upload the new PDF and delete the old one
        if (fileData) {
            // Delete old PDF first (optional, but good for cleanup)
            if (template.pdfUrl) {
                await deleteSignDocument(template.pdfUrl);
            }
            updatedPdfUrl = await uploadSignDocument(name.replace(/\s/g, '_') + '_' + Date.now(), fileData);
        }

        await template.update({
            name: name || template.name,
            pdfUrl: updatedPdfUrl,
            fields: fields || template.fields,
        });
        res.status(200).json(template);
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ message: 'Failed to update template', error: error.message });
    }
};

// Delete a template
exports.deleteTemplate = async (req, res) => {
    const { id } = req.params;
    try {
        const template = await SignTemplate.findByPk(id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found.' });
        }

        // Delete the associated PDF file
        if (template.pdfUrl) {
            await deleteSignDocument(template.pdfUrl);
        }

        await template.destroy();
        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ message: 'Failed to delete template', error: error.message });
    }
};
