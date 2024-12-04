const router = require("../config/express");
const path = require("path");
const fs = require("fs");
router.get('/images/:location/:filename', (req, res) => {
    const {location, filename} = req.params
    if (!filename || filename === "no-image.png") {
        return res.sendFile(path.join(__dirname, "../", "images", "no-image.png"))
    }
    const filepath = path.join(__dirname, "../", "images", location, filename)
    if (fs.existsSync(filepath)) {
        return res.sendFile(filepath)
    } else {
        return res.status(404).send('Image not found')
    }
})