const _ = require('lodash');
const Joi = require('joi');

const Cases = require('../models').cases;
const Websites = require('../models').websites;
const CustomerPayments = require('../models').customer_payments;
const Attachments = require('../models').attachments;
const Plans = require('../models').case_plans;
const Status = require('../models').case_status;
const WebStatus = require('../models').website_status;
const Users = require('../models').users;
const Feedbacks = require('../models').case_feedbacks;
const sequelize = require('sequelize');
const config = require('../config/config.json');
const cryptoServices = require('../services/crypto');
const { upload } = require('../services/uploader');
const readChunk = require('read-chunk');
const fileType = require('file-type');
const S3 = require('../services/s3Uploads');
const fs = require('fs');
const { all } = require('bluebird');
const Braintree = require('../services/braintree');
const string = require('../utils/string');
const Redis = require('../utils/redis');


module.exports = {
  getCaseDetails(req, res) {
    let caseID = req.params.caseid || req.params.caseID;
    let iCustomerID = req.user.id;
    let oData = {
      case_uuid: caseID,
    }
    if (req.params.caseID) {
      oData = {...oData, 
        agent_id: req.user.id
      };
    }else {
      oData = {
        ...oData,
        customer_id: req.user.id
      }
    }
    return Cases.findOne({ where: oData })
    .then(caseDetails => {
      if (!caseDetails) {
        return res.send({});
      }
      let sCaseID = cryptoServices.generateS3KeyByUserID(caseID);
      let BASEURL = config.upload_base_url;
      // let _case = kaso.dataValues;
      // let aAttachments = kaso.dataValues.attachments.map((v, i) => {
      //   return {...v, fullpath: `${BASEURL}/${sCaseID}/${v.link}`}
      // });
      // console.log({ ..._case,
      //   attachments: aAttachments
      // });
      res.status(200).send({
        caseDetails,
        base: `${BASEURL}/${sCaseID}/`,
      });
    })
    .catch(error => {
      console.error(error);
      res.status(400).send(error)
    });
  },
  listCustomerCases(req, res) {
    return Cases.findAll({
      where: {
        customer_id: req.user.id,
        is_deleted: false
      },
      order: [
        ['createdAt', 'DESC'],
        [ Websites, 'id', 'ASC']
      ],
      include: [{
        model: Websites,
        as: 'websites',
        attributes: ['name'],
      }, {
        model: Status,
        as: 'status',
        attributes: ['id', 'name', 'description']
      }]
    })
    .then(cases => res.status(200).send(cases))
    .catch(error => res.status(400).send(error));
  },
  createCase(req, res) {
    // Joi validation
    const schema = Joi.object().keys({
      plan_id: Joi.number().required(),
      comments: Joi.string().optional(),
      type: Joi.string(),
      nonce: Joi.string().required(), // Add nonce for cases
      websites: Joi.array().min(1).items(Joi.object({
          url: Joi.string().required()
      })).required(),
    });
    // You can also pass a callback which will be called synchronously with the validation result.
    Joi.validate(req.body, schema, { abortEarly : false },(err, value) => { 
      if(err) {
        return res.send(err);
      }
      
      // Get Plan details by ID
      return Plans.find({
        where: {
          id: req.body.plan_id,
        }
      }).then( data => {
        
        if (typeof data.amount === 'undefined') {
          return res.status(400).send({
            message: 'invalid plan.'
          });
        }
        // Pay using Braintree first before creating transaction
        return Braintree.transaction.sale({
          amount: data.amount,
          paymentMethodNonce: req.body.nonce,
          options: {
            submitForSettlement: true,
            threeDSecure: {
              required: true
            }
          }
        }, (err, sale) => {
          if (sale.success === false || (sale.transaction.threeDSecureInfo !== null && sale.transaction.threeDSecureInfo.liabilityShifted === false)) {
            return res.status(400).send({
              message: sale.message
            });
          }

          let caseUUID = null;
          // Make sure liability was shifted.
          return Websites.sequelize.transaction(t => {
            // chain all your queries here. make sure you return them.
            return Cases.create({
              plan_id: req.body.plan_id,
              customer_id: req.user.id,
              comments: req.body.comments
            }, { transaction: t })
              .then(cases => {
                let promises = [];
                caseUUID = cases.case_uuid;
                _.forEach(req.body.websites, value => {
                  const newPromise = Websites.create({ case_uuid: cases.case_uuid, name: value.url }, { transaction: t });
                  promises.push(newPromise);
                });

                return Promise.all(promises).then(webs => {
                  cases.dataValues.websites = webs;
                  return cases;
                }).catch(err => err);
              });
          }).then(result => {
            // Transaction has been committed
            // result is whatever the result of the promise chain returned to the transaction callback
            let sPayment = 'braintree';
            let sTransactionID = sale.transaction.id;
            if (req.body.type === 'PayPalAccount') {
              sPayment = 'paypal';
              sTransactionID = `${sale.transaction.paypal.paymentId}:${sale.transaction.paypal.authorizationId}`;
            }
            
            // customer payment shall be independent.
            CustomerPayments.create({
              transaction_id: sTransactionID,
              gateway: sPayment,
              amount: data.amount,
              particulars: 'DPR Payments',
              user_id: req.user.id,
              case_uuid: caseUUID
            });

            // Enable processing this transaction after 2 hours.
            Queuer.queue('bt-pending', sTransactionID, 7200);
            res.status(200).json(result);
          }).catch(err => {
            res.status(500).json(err);
            // Transaction has been rolled back
            // err is whatever rejected the promise chain returned to the transaction callback
          });
        })
      });
    })
  },
  /**
   * Uploads Case Attachments
   */
  uploadCaseAttachments(req, res) {
    let sCaseID = req.params.caseid;

    // initiate upload
    return upload(req, res, (err, files) => {
      if (err) {
        return res.json(err);
      }
      
      let aSuccess = files.map((file) => {
        // extract file 
        let { path } = file;
        let buffer = readChunk.sync(path, 0, 4100);
        let fileInfo = fileType(buffer);
        let isValid = fileInfo !== null ? config.valid_extensions.indexOf(fileInfo.ext) : -1;
        if (isValid !== -1) {
          let newpath = path + '.' + fileInfo.ext
          fs.rename(path, newpath, (err) => {
            return null
          });
          return {
            path: newpath,
            filename: string.Truncate(file.originalname.trim(), '...'),
          };
        }
        fs.unlink(path, (err) => {
          if (err) {
            throw err;
          }
        });

      }).filter(n => n);

      // CLINT TODO
      // Create transaction for inserting attachment to DB.
      // INSERT INTO attachments (case_uuid, link) VALUES (?, ?)
      // so that S3 will be in sync with DB.
      // After insertion, upload to S3 but don't let it wait. just send the response to client
      // use transactions in order to batch insert everything into DB. Use the one below as callback
      // The lines from START to END should be enclosed in a callback or .then of the DB Insert

      return Attachments.sequelize.transaction(t => {
        let promises = [];
        _.forEach(aSuccess, filepath => {
          // console.log(filepath);
          let sFileName = filepath.path.match(new RegExp(/([a-z0-9\.])+$/))[0];
          let ext = sFileName.split('.')[1];
          const newPromise = Attachments.create({ case_uuid: sCaseID, link: sFileName, file_name: filepath.filename, file_type: ext, user_id: req.user.id }, { transaction: t });
          promises.push(newPromise);
        });

        return Promise.all(promises);
      })
      .then(result =>{
        // START
        let aPromises = [];
        for (let i = 0; i < aSuccess.length; i++) {
          let filepath = aSuccess[i].path;
          let sFileName = filepath.match(new RegExp(/([a-z0-9\.])+$/))[0];
          let ext = sFileName.split('.')[1];
          aPromises.push(S3.S3Upload(sCaseID, sFileName, filepath, ext));
        }

        // Process all the promises of the upload files
        all(aPromises).then((val) => {
          // once the files has been uoploaded,
          // delete.
          aSuccess.map((filepath) => {
            // remember to delete the files afterwards to maintain disk capacity to a minimum.
            fs.unlink(filepath.path, () => {return null});
          });
          return null;
        }).catch((err) => {
          console.error(err);
          res.status(500).send(err);
        });
        
        return res.send(result);
        // END
      }).catch(err => {
        console.error(err);
        res.status(500).send(err);
      });
    })
  },
  getUploadKey(req, res) {
    let key = `${new Date().toISOString()}${req.user.id}${config.upload_secret}`
    key = cryptoServices.hashString(key);
    res.send(key);
  }
}