const Products = require('../models').products;
const multer = require('multer');
const cryptoServices = require('../services/crypto');
const config = require('../config/config.json');
const path = require('path');

module.exports = {
  addProduct(req, res) {
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
        let details_image = '';
        let img_url = '';
        req.files.forEach(function (item) {
          if(item.fieldname == 'details_image'){
            details_image = item.filename;
          }

          if (item.fieldname == 'photo') {
            img_url = item.filename;
          }
        });

        // After successful upload insert product to database
        return Products.create({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          sale_price: req.body.sale_price,
          img_url: img_url || '',
          details_image: details_image || '',
          type_id: parseInt(req.body.type_id) || 1,
          promo_expiry: req.body.promo_expiry || null,
          quantity: req.body.quantity || 0
        }).then(result => {
          res.status(200).json(result);
        }).catch(err => {
          res.status(500).json(err);
        });
      }
    });
  },
  listProducts(req, res) {
    return Products
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
  getProductDetails(req, res) {
    return Products
      .findById(parseInt(req.params.id))
      .then(product => {
        if (!product) {
          return res.status(404).send({
            message: 'Product Not Found',
          });
        }
        return res.status(200).send(product);
      })
      .catch(error => res.status(400).send(error));
  },
  updateProduct(req, res) {
    return Products
      .findById(parseInt(req.params.id))
      .then(product => {
        if (!product) {
          return res.status(404).send({
            message: 'Product Not Found',
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
            let details_image = '';
            let img_url = '';
            req.files.forEach(function (item) {
              if (item.fieldname == 'details_image') {
                details_image = item.filename;
              }

              if (item.fieldname == 'photo') {
                img_url = item.filename;
              }
            });

            // After successful upload insert product to database
            return product
            .update({
              type_id: parseInt(req.body.type_id) || 1,
              name: req.body.name,
              description: req.body.description,
              price: req.body.price,
              sale_price: req.body.sale_price,
              img_url: img_url || '',
              details_image: details_image || '',
              promo_expiry: req.body.promo_expiry || null,
              quantity: req.body.quantity || 0
            })
            .then(() => res.status(200).send(product))  // Send back the updated todo.
            .catch((error) => res.status(400).send(error));
          }
        });
      })
      .catch((error) => res.status(400).send(error));
  },
  deleteProduct(req, res) {
    return Products
      .findById(parseInt(req.params.id))
      .then(product => {
        if (!product) {
          return res.status(400).send({
            message: 'Product Not Found',
          });
        }
        return product
          .update({
            is_deleted: true,
          })
          .then(() => res.status(200).send({ message: 'Product deleted successfully.' }))
          .catch(error => res.status(400).send('hey'));
      })
      .catch(error => res.status(400).send(error));
  },
};


