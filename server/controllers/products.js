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
        cb(null, cryptoServices.hashString(`${new Date().toISOString()}${file.originalname}`) + '.' + ext);
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
        // console.log(req.body);
        req.files.forEach(function (item) {
          // console.log(item);
          // move your file to destination
        });
        res.end('File uploaded');
      }
    });
  },
  list(req, res) {
    return Todo
      .all()
      .then(todos => res.status(200).send(todos))
      .catch(error => res.status(400).send(error));
  },
  listWithItems(req, res) {
    return Todo
      .findAll({
        include: [{
          model: TodoItem,
          as: 'todoItems',
        }],
      })
      .then(todos => res.status(200).send(todos))
      .catch(error => res.status(400).send(error));
  },
  retrieve(req, res) {
    return Todo
      .findById(req.params.todoId, {
        include: [{
          model: TodoItem,
          as: 'todoItems',
        }],
      })
      .then(todo => {
        if (!todo) {
          return res.status(404).send({
            message: 'Todo Not Found',
          });
        }
        return res.status(200).send(todo);
      })
      .catch(error => res.status(400).send(error));
  },
  update(req, res) {
    return Todo
      .findById(req.params.todoId, {
        include: [{
          model: TodoItem,
          as: 'todoItems',
        }],
      })
      .then(todo => {
        if (!todo) {
          return res.status(404).send({
            message: 'Todo Not Found',
          });
        }
        return todo
          .update({
            title: req.body.title || todo.title,
          })
          .then(() => res.status(200).send(todo))  // Send back the updated todo.
          .catch((error) => res.status(400).send(error));
      })
      .catch((error) => res.status(400).send(error));
  },
  destroy(req, res) {
    return Todo
      .findById(req.params.todoId)
      .then(todo => {
        if (!todo) {
          return res.status(400).send({
            message: 'Todo Not Found',
          });
        }
        return todo
          .destroy()
          .then(() => res.status(200).send({ message: 'Todo deleted successfully.' }))
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },
};

