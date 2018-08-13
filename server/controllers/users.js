const Users = require('../models').users;
const ms = require('ms');
const Joi = require('joi');
const SQLize = require('sequelize');
const Op = SQLize.Op;

const secret = require('../config/config.json')['secret'];
const config = require('../config/config.json');
const jwtExpire = require('../config/config.json')['jwtExpire'];
const cryptoServices = require('../services/crypto');
const redisServices = require('../services/redis');
const sendGrid = require('../services/sendgrid');
const Braintree = require('../services/braintree');
const email = require('../services/email');

const jwt = require('jsonwebtoken');

const tokenForUser = user => {
  return {
    key: jwt.sign({
      sub: user
    }, secret, { expiresIn: jwtExpire }),
    offset: ms(jwtExpire) * .9
  }
}
module.exports = {
  createAdmin(req, res) {
    // Joi validation
    const schema = Joi.object().keys({
      username: Joi.string().regex(/^[a-zA-Z0-9\.\s]{2,30}$/).required(),
      password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
      email: Joi.string().email().required(),
    });

    // You can also pass a callback which will be called synchronously with the validation result.
    Joi.validate(req.body, schema, { abortEarly : false },(err, value) => { 
      if(err) {
        return res.send(err);
      }

      return Users
        .find({
          where: {
            [Op.or]: [{ email: req.body.email }, { username: req.body.username }]
          }
        })
        .then(user => {
          // check if user already exist
          if (user) {
            return res.status(200).send({
              message: 'Email or username already exist',
            });
          }

          // encrypt password
          const encrypted = cryptoServices.generatePassword(req.body.password);

          return Users.create({
                user_type_id: 1,
                username: req.body.username,
                email: req.body.email,
                password: encrypted,
              })
              .then(user => {
                
                res.status(200).json({
                  user: {
                    id: user.id,
                    user_type: user.user_type_id,
                  }, token: tokenForUser(user.id)
                });
              })
              .catch(error => res.status(400).send(error));
        })
        .catch(error => res.status(400).send('error'));  
     });
  },
  registerAgent(req, res) {

    // Joi validation
    const schema = Joi.object().keys({
      forename: Joi.string().regex(/^[a-zA-Z0-9\.\s]{2,30}$/).required(),
      surname: Joi.string().regex(/^[a-zA-Z0-9\.\s]{2,30}$/).required(),
      password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().regex(/^[a-zA-Z0-9\.\s\-\+]{2,30}$/).required(),
      city: Joi.string().regex(/^[a-zA-Z0-9\.\s]{2,30}$/).required(),
      country: Joi.string().regex(/^[a-zA-Z0-9\.\s]{2,30}$/).required(),
      bank_no: Joi.string().alphanum()
    });

    Joi.validate(req.body, schema, { abortEarly: false }, (err, value) => {
      if (err) {
        return res.send(err);
      }

      return Users
        .find({
          where: {
            email: req.body.email
          }
        })
        .then(user => {
          if (user) {
            return res.status(200).send({
              message: 'Email already exist',
            });
          }

          const encrypted = cryptoServices.generatePassword(req.body.password);

          return Users
            .create({
              user_type_id: config.agent_id,
              forename: req.body.forename,
              surname: req.body.surname,
              email: req.body.email,
              password: encrypted,
              phone_number: req.body.phone,
              city: req.body.city,
              country: req.body.country,
              bank_no: req.body.bank_no,
              is_verified: false
            })
            .then(user => {
                email.sendConfirmation(user, req.get('host'));
                res.status(200).send({
                user: {
                  id: user.id,
                  user_type: user.user_type_id,
                  forename: user.forename,
                  surname: user.surname,
                  password: user.password
                }, token: tokenForUser(user.id)
              })
            })
            .catch(error => {
              console.error(error);
              res.status(400).send('There is an error upon user registration');
            });
        })
        .catch(error => {
          console.error(error);
          res.status(400).send('There is an error finding user availability')
        });
    });
  },
  signIn(req, res, next) {
    // User has already had their email and password auth'd
    // We just need to give them a token
    let Something = Object.assign({}, req.user.dataValues);
    delete (Something.password)
    res.send({ user: Something, token: tokenForUser(req.user.id)}) 
  },
  contactUs(req, res) {
    try {
      const { email_from, name_from, subject, content } = req.body;
      
      let mailOptions = {
        email_to: 'clintelligent182@gmail.com',
        name_to: 'Someone',
        email_from,
        name_from,
        subject,
        content
      }
      
      sendGrid.sendMail(mailOptions);
      
      res.send('Email Sent');
    } catch (error) {
      res.send(error);
    }
  },
  refreshToken(req, res) {
    res.send(tokenForUser(req.user.id));
  },
  listCustomers(req, res) {
    // find all 
    let oParams = {};
    let iLimit = 10;
    let iOffset = 0;
    let aOrder = ['createdAt', 'DESC']
    let iPage = 1;
    let aColumns = ['email', 'forename', 'id', 'createdAt']
    let aDirs = ['ASC', 'DESC', 'desc', 'asc'];

    /// if user type id is defined
    if (req.body.user_type_id) {
      oParams.user_type_id = req.body.user_type_id;
    }

    // if the user verified 
    if (req.body.is_verified == "true") {
      oParams.is_verified = true;
    }else if (req.body.is_verified == "false") {
      oParams.is_verified = false;
    }

    // check items per page  - define limit first to determine offset
    if (parseInt(req.body.items_per_page) > 0) {
      if (req.body.items_per_page < 100) {
        iLimit = req.body.items_per_page 
      }
    } 

    if (req.body.search_key) {
      oParams.email = {
        // iLike for Postgres ONLY!
        [SQLize.Op.iLike]: `%${req.body.search_key}%`
      }
    }

    // determine offset.
    if (parseInt(req.body.page) > 1) {
      iPage = parseInt(req.body.page);
      iOffset = (iPage - 1) * iLimit;
    }

    if (req.body.order) {
      if (aColumns.indexOf(req.body.order) >= 0) {
        aOrder[0] = req.body.order;
      }
    }

    if (req.body.sort_dir) {
      if (aDirs.indexOf(req.body.sort_dir) >= 0) {
        aOrder[1] = req.body.sort_dir;
      }
    }

    // count first
    return Users.findOne({
      where: oParams,
      attributes: [[SQLize.fn('COUNT', SQLize.col('id')), 'count']]
    }).then((data) => {
      let itemCount = parseInt(data.dataValues.count);
      let numPages = Math.ceil(itemCount / iLimit);
      let hasNext = false;
      let hasPrev = false;
      
      // if the current page != || < numpages
      if (iPage < numPages) {
        hasNext = true;
      }

      if (iPage > 1) {
        hasPrev = true;
      }

      // fetch all items with all parameters. it's slow but only the admin will use this.
      return Users.findAll({
        where: oParams,
        limit: iLimit,
        offset: iOffset,
        order: [aOrder],
        attributes: ['id', 'forename', 'surname', 'email', 'phone_number', 'user_type_id', 'is_verified', 'createdAt']
      }).then((result) => {
        
        return res.send({
          count: itemCount,
          pages: numPages,
          hasNext: hasNext,
          hasPrev: hasPrev,
          result: result
        });
        
      }).catch((err) => {
        console.error(err);
        return res.send('there is an error querying for users');
      })

    }).catch((err) => {
      console.error(err);
      return res.send('there is an error processing users');
    });


  },
  GetProfile(req, res) {
    delete(req.user.dataValues.password);
    return res.send(req.user);
  },
  GeneratePassword(req, res, next) {
    if (req.body.password) {
      // verify if password is = confirmpass
      if (req.body.password !== req.body.confirm_password) {
        return res.status(400).send({
          message: 'Passwords must match'
        });
      }
      req.password = cryptoServices.generatePassword(req.body.password);
    }
    next();
  },
  UpdateProfile(req, res, next) {

    let oObject = {
      forename: req.body.forename,
      surname: req.body.surname,
      phone: req.body.phone,
      city: req.body.city,
      country: req.body.country,
    };

    let oValidationRequirements = {
      forename: Joi.string().regex(/^[a-zA-Z0-9\.\s]{2,30}$/, (err) => "HELLO").required(),
      surname: Joi.string().regex(/^[a-zA-Z0-9\.\s]{2,30}$/).required(),
      password: Joi.string().optional(),
      phone: Joi.string().regex(/^[a-zA-Z0-9\.\s\-\+]{2,30}$/),
      city: Joi.string().optional(),
      country: Joi.string().optional()
    };

    // if the user is an agent
    if (req.user.user_type_id === 3) {
      oObject.bank_no = req.body.bank_no;
      oValidationRequirements['bank_no'] = Joi.string();
    }

    if (req.password) {
      oObject.password = req.password;
    }

    const schema = Joi.object().keys(oValidationRequirements);
    
    return Joi.validate(oObject, schema, { abortEarly: false },  (err, values) => {
      if (err) {
        return res.status(400).send(err);
      }

      // Update user.
      return Users.update(oObject, {
        where: {
          id: req.user.id,
        },
        returning: true,
      }).then((data) => {
        return res.send('ok');
      }).catch((err) => {
        console.error(err);
        return res.status(400).send(err);
      })
    });

  }
}