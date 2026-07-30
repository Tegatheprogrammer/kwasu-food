const multer = require('multer');

// Images are kept in memory just long enough to convert them to a base64
// data URI (see uploadMenuImage in vendorController.js) and store them in the
// database directly. Writing them to disk isn't reliable here because the
// app's filesystem is ephemeral on the hosting platform - uploaded files get
// wiped on every redeploy while the database keeps pointing at them.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
};

module.exports = multer({
    storage,
    fileFilter,
    // Kept modest since each image is stored as base64 in the database (~33%
    // larger than the raw file) - this stays safely under conservative
    // max_allowed_packet defaults on managed MySQL hosts
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});
