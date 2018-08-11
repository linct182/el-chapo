const multer = require('multer');
const config = require('../config/config.json');
const cryptoServices = require('./crypto');
// define where to store and the file name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.app_uploads_path);
    },
    filename: (req, file, cb) => {
        cb(null, cryptoServices.hashString(`${new Date().toISOString()}${file.originalname}`));
    }
});

// define the upload function with storage, limits and parameter
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 6, // 6Mib
    },
    onError: (err, next) => {
        next(err);
    }
}).array('attachments', config.max_attachments);

module.exports = {
    upload: (req, res, fCallback) => {
        upload(req, res, (err) => {
            return fCallback(err, req.files);
        })
    },
    verifyUpload: () => {

    }
}