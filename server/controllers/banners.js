const Banners = require('../models').banners;
const multer = require('multer');
const cryptoServices = require('../services/crypto');
const config = require('../config/config.json');
const path = require('path');

module.exports = {
  addBanner(req, res) {
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
        return Banners.create({
          title: req.body.title,
          description: req.body.description,
          img_url: img_url || '',
          is_home: req.body.is_home
        }).then(result => {
          res.status(200).json(result);
        }).catch(err => {
          res.status(500).json(err);
        });
      }
    });
  },
  listHomeBanners(req, res) {
    return Banners
      .findAll({
        where: { is_deleted: false, is_home: true },
        order: [['id', 'DESC']]
      })
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error));
  },
  listPageBanners(req, res) {
    return Banners
      .findAll({
        where: { is_deleted: false, is_home: false },
        order: [['id', 'DESC']]
      })
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error));
  },
  getBannerDetails(req, res) {
    return Banners
      .findById(parseInt(req.params.id))
      .then(banners => {
        if (!banners) {
          return res.status(404).send({
            message: 'Banner Not Found',
          });
        }
        return res.status(200).send(banners);
      })
      .catch(error => res.status(400).send(error));
  },
  updateBanner(req, res) {
    return Banners
      .findById(parseInt(req.params.id))
      .then(banners => {
        if (!banners) {
          return res.status(404).send({
            message: 'Banner Not Found',
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

            // After successful upload insert product to database
            return banners
            .update({
              title: req.body.title,
              description: req.body.description,
              img_url: img_url || '',
              is_home: req.body.is_home
            })
            .then(() => res.status(200).send(banners))  // Send back the updated todo.
            .catch((error) => res.status(400).send(error));
          }
        });
      })
      .catch((error) => res.status(400).send(error));
  },
  deleteBanner(req, res) {
    return Banners
      .findById(parseInt(req.params.id))
      .then(banners => {
        if (!banners) {
          return res.status(400).send({
            message: 'Banner Not Found',
          });
        }
        return banners
          .update({
            is_deleted: true,
          })
          .then(() => res.status(200).send({ message: 'Banner deleted successfully.' }))
          .catch(error => res.status(400).send('error'));
      })
      .catch(error => res.status(400).send(error));
  },
};


