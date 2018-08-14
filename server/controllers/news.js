const News = require('../models').news;
const multer = require('multer');
const cryptoServices = require('../services/crypto');
const config = require('../config/config.json');
const path = require('path');

module.exports = {
  addNews(req, res) {
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
        return News.create({
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
  listNews(req, res) {
    return News
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
  getNewsDetails(req, res) {
    return News
      .findById(parseInt(req.params.id))
      .then(news => {
        if (!news) {
          return res.status(404).send({
            message: 'News Not Found',
          });
        }
        return res.status(200).send(news);
      })
      .catch(error => res.status(400).send(error));
  },
  updateNews(req, res) {
    return News
      .findById(parseInt(req.params.id))
      .then(news => {
        if (!news) {
          return res.status(404).send({
            message: 'News Not Found',
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
            return news
            .update({
              title: req.body.title,
              description: req.body.description,
              img_url: img_url || '',
            })
            .then(() => res.status(200).send(news))  // Send back the updated todo.
            .catch((error) => res.status(400).send(error));
          }
        });
      })
      .catch((error) => res.status(400).send(error));
  },
  deleteNews(req, res) {
    return News
      .findById(parseInt(req.params.id))
      .then(news => {
        if (!news) {
          return res.status(400).send({
            message: 'News Not Found',
          });
        }
        return news
          .update({
            is_deleted: true,
          })
          .then(() => res.status(200).send({ message: 'News deleted successfully.' }))
          .catch(error => res.status(400).send('error'));
      })
      .catch(error => res.status(400).send(error));
  },
};


