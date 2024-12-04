const router = require("../config/express");
const path = require("path");
const fs = require("fs");
router.get('/files/:location/:filename', (req, res) => {
    const {location, filename} = req.params
    if (!filename) {
        return res.status(404).send('File not found')
    }
    const filepath = path.join(__dirname, "../", "files", location, filename)
    if (fs.existsSync(filepath)) {
        return res.sendFile(filepath)
    } else {
        return res.status(404).send('File not found')
    }
})