// api/routes/fileServingRoutes.js
const router = require("../config/express");
const path = require("path");
const fs = require("fs");

// Define the base directory where your documents are stored.
// This path should be relative to where your 'api' folder is.
// Assuming 'api/routes' is two levels deep from the project root (e.g., project-root/api/routes)
// and 'documents' is directly under 'project-root'.
const DOCUMENTS_BASE_DIR = path.join(__dirname, '../' , 'documents', 'sign-app');

console.log(`[fileServingRoutes] Documents base directory set to: ${DOCUMENTS_BASE_DIR}`);

/**
 * Route to serve PDF files from the /documents/sign-app directory.
 * This mimics the logic of your image serving route.
 * Example usage: GET /documents/sign-app/your_document_name.pdf
 */
router.get('/documents/sign-app/:filename', (req, res) => {
    const { filename } = req.params;
    console.log('something happened');
    if (!filename) {
        console.warn('[fileServingRoutes] Attempted to access /documents/sign-app/ with no filename.');
        return res.status(400).send('Filename is required.');
    }

    // Construct the full absolute path to the requested file
    const filePath = path.join(DOCUMENTS_BASE_DIR, filename);
    console.log(`[fileServingRoutes] Attempting to serve file: ${filePath}`);

    // Check if the file exists before attempting to send it
    if (fs.existsSync(filePath)) {
        // Send the file. Express handles content-type automatically for common file types like PDF.
        return res.sendFile(filePath);
    } else {
        console.error(`[fileServingRoutes] File not found: ${filePath}`);
        return res.status(404).send('Document not found.');
    }
});

module.exports = router;
