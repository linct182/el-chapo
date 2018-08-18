const Settings = require('../models').settings;
const multer = require('multer');
const cryptoServices = require('../services/crypto');
const config = require('../config/config.json');
const path = require('path');

module.exports = {
  updateLogo(req, res) {
    return Settings
      .findOne({
        where: { title: 'settings-1' }
      })
      .then(settings => {
        if (!settings) {
          return res.status(404).send({
            message: 'Settings Not Found',
          });
        }

        const storage = multer.diskStorage({
          destination: (req, file, cb) => {
            cb(null, config.app_uploads_path);
          },
          filename: (req, file, cb) => {
            var ext = path.extname(file.originalname);
            cb(null, cryptoServices.hashString(`${new Date().toISOString()}${file.originalname}`) + ext);
          }
        });

        var upload = multer({
          storage: storage,
          fileFilter: function (req, file, callback) {
            var ext = path.extname(file.originalname);
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
              return callback(new Error('Only images are allowed'))
            }
            callback(null, true)
          },
          limits: {
            fileSize: 1024 * 1024 * 2,
          }
        }).any();

        upload(req, res, function (err) {
          if (err) {
            return res.end('Error: ' + err.message);
          } else {
            let img_url = '';
            req.files.forEach(function (item) {

              if (item.fieldname == 'logo_img') {
                img_url = item.filename;
              }
            });

            // After successful upload insert product to database
            return settings
              .update({
                logo_url: img_url || '',
              })
              .then(() => res.status(200).send(settings))  // Send back the updated todo.
              .catch((error) => res.status(400).send(error));
          }
        });
      })
      .catch((error) => res.status(400).send(error));
  },
  updateAboutUs(req, res) {
    return Settings
      .findOne({
        where: { title: 'settings-1' }
      })
      .then(settings => {
        if (!settings) {
          return res.status(404).send({
            message: 'Settings Not Found',
          });
        }

        const storage = multer.diskStorage({
          destination: (req, file, cb) => {
            cb(null, config.app_uploads_path);
          },
          filename: (req, file, cb) => {
            var ext = path.extname(file.originalname);
            cb(null, cryptoServices.hashString(`${new Date().toISOString()}${file.originalname}`) + ext);
          }
        });

        var upload = multer({
          storage: storage,
          fileFilter: function (req, file, callback) {
            var ext = path.extname(file.originalname);
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
              return callback(new Error('Only images are allowed'))
            }
            callback(null, true)
          },
          limits: {
            fileSize: 1024 * 1024 * 2,
          }
        }).any();
        
        upload(req, res, function (err) {
          if (err) {
            return res.end('Error: ' + err.message);
          } else {
            let img_url = '';
            req.files.forEach(function (item) {

              if (item.fieldname == 'image') {
                img_url = item.filename;
              }
            });

            // After successful upload insert product to database
            return settings
              .update({
                about_us_title: req.body.title || '',
                about_us_description: req.body.description || '',
                about_us_img: img_url || '',
              })
              .then(() => res.status(200).send(settings))  // Send back the updated todo.
              .catch((error) => res.status(400).send(error));
          }
        });
      })
      .catch((error) => res.status(400).send(error));
  },
  getSettings(req, res) {
    return Settings
      .findOne({
        where: { title: 'settings-1' }
      })
      .then(settings => {
        if (!settings) {
          return res.status(404).send({
            message: 'Settings Not Found',
          });
        }
        return res.status(200).send(settings);
      })
      .catch(error => res.status(400).send(error));
  }
};


