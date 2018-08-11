const multer = require('multer');
const _ = require('lodash');
const mailServices = require('../services/sendgrid');
const path = require('path');
const cryptoServices = require('../services/crypto');
const redisServices = require('../services/redis');
const customersController = require('../controllers').customers;
const config = require('../config/config.json');
const readChunk = require('read-chunk');
const fileType = require('file-type');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.app_uploads_path);
  },
  filename: (req, file, cb) => {
    cb(null, cryptoServices.hashString(`${new Date().toISOString()}${file.originalname}`));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 600,
  },
  onError : (err, next) => {
    next(err);
  }
}).array('attachments', config.max_attachments);

module.exports = (app) => {
  // Testers
  app.get('/test/crypto', cryptoServices.randomTester);
  app.post('/test/redis', redisServices.sendLink);
  app.post('/test/mail', mailServices.testEmail);
};