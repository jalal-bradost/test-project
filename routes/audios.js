const router = require("../config/express");
const path = require("path");
const fs = require("fs");
router.get('/audios/:location/:filename', (req, res) => {
    const {location, filename} = req.params
    if (!filename) {
        return res.status(404).send('Audio not found')
    }
    const filepath = path.join(__dirname, "../", "audios", location, filename)
    if (fs.existsSync(filepath)) {
        return res.sendFile(filepath)
    } else {
        return res.status(404).send('Audio not found')
    }
})