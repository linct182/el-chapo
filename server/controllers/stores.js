const Stores = require('../models').stores;
const multer = require('multer');
const cryptoServices = require('../services/crypto');
const config = require('../config/config.json');
const path = require('path');

module.exports = {
  addStores(req, res) {
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
          if (item.fieldname == 'photo') {
            img_url = item.filename;
          }
        });

        // After successful upload insert product to database
        return Stores.create({
          title: req.body.title,
          description: req.body.description,
          img_url: img_url || '',
        }).then(result => {
          res.status(200).json(result);
        }).catch(err => {
          res.status(500).json(err);
        });
      }
    });
  },
  listStores(req, res) {
    return Stores
      .findAll({
        where: { is_deleted: false },
        order: [['id', 'DESC']]
      })
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error));
  },
  listPromos(req, res) {
    return Products
      .findAll({
        where: { is_deleted: false, type_id: 2 },
        order: [['id', 'DESC']]
      })
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error));
  },
  getStoresDetails(req, res) {
    return Stores
      .findById(parseInt(req.params.id))
      .then(stores => {
        if (!stores) {
          return res.status(404).send({
            message: 'Stores Not Found',
          });
        }
        return res.status(200).send(stores);
      })
      .catch(error => res.status(400).send(error));
  },
  updateStores(req, res) {
    return Stores
      .findById(parseInt(req.params.id))
      .then(stores => {
        if (!stores) {
          return res.status(404).send({
            message: 'Stores Not Found',
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

              if (item.fieldname == 'photo') {
                img_url = item.filename;
              }
            });

            let params = {
              title: req.body.title,
              description: req.body.description
            };

            if (img_url != '') {
              params = { ...params, img_url: img_url }
            }

            // After successful upload insert product to database
            return stores
            .update(params)
            .then(() => res.status(200).send(stores))  // Send back the updated todo.
            .catch((error) => res.status(400).send(error));
          }
        });
      })
      .catch((error) => res.status(400).send(error));
  },
  deleteStores(req, res) {
    return Stores
      .findById(parseInt(req.params.id))
      .then(stores => {
        if (!stores) {
          return res.status(400).send({
            message: 'Stores Not Found',
          });
        }
        return stores
          .update({
            is_deleted: true,
          })
          .then(() => res.status(200).send({ message: 'Stores deleted successfully.' }))
          .catch(error => res.status(400).send('error'));
      })
      .catch(error => res.status(400).send(error));
  },
};


