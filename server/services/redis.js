const cryptoServices = require('../services/crypto');
const sendGrid = require('../services/sendgrid');
const web_url = require('../config/config.json')['web-url'];
const ms = require('ms');
const email_banner = require('../config/config.json')['email_banner'];
const emailFrom = require('../config/config.json')['email_from'];
const secretKeyDuration = (ms(require('../config/config.json')['secret_key_duration']) / 1000);
const redisClient = require('../utils/redis');
const async = require('async');

const Users = require('../models').users;

module.exports = {
  testRedis(req, res) {
    redisClient.set('oink:', req.query.val);
  },
  verifyLink(req, res) {
      const result = async.waterfall([
        callback => {
          let {user, key} = req.params;
          user = parseInt(user);
          redisClient.get('users:' + user, (err, resp) => {
              if(resp === key) {
                  redisClient.del(user);
                  return callback(null, key);
              }
              callback(true, { status: 200, message: "Email was already verified"});
          });
        },
        (key, callback) => {
          redisClient.get('keys:' + key, (err, resp) => {
            redisClient.del('keys:' + key);
            callback(null, resp);
          });
        }, (user_id, callback) => {
          Users.findById(user_id)
            .then(user => {
              if (!user) {
                return callback(true, {
                  status: 404,
                  message: 'User Not Found'
                });
              }
              user.update({
                is_verified: true,
              })
              .then(() => {
                callback(null, { status: 200, message: 'Email was verified' })
              })  // Send back the updated todo.
              .catch((error) => callback(true, error));
            })
            .catch((error) => callback(true, error));
        }
      ], (err, data) => {
        res.send(data);
      });
      
  },
  sendLink(user, host) {
    async.waterfall([
      // Check if keyspace exists.
      callback => {
        const key = cryptoServices.generateRedis(user.id);

        redisClient.exists('keys:' + key, (err, reply) => {
          if (err) {
            return callback(true, "Error in redis");
          }
          if (reply === 1) {
            return callback(true, "User already requested");
          }
          callback(null, key);
        });
      },
      (encodedUserKey, callback) => {
        const key = cryptoServices.generateRandomString();
        // Generating random string.
        let link =`${web_url}/verify/${encodedUserKey}/${key}`;
        let mailOptions = {
          email_to: user.email,
          name_to: `${user.forename} ${user.surname}`,
          email_from: emailFrom,
          name_from: 'DataPrivacyRights',
          subject: 'Email Verification',
          content: `
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
              <td><img src="${email_banner}" alt="DataPrivacyRights" width="600" height="auto" style="display: block;" /></td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 40px; border: 1px solid #cacaca;">
                <h3>Hi ${user.forename} ${user.surname},</h3>
                <p style="margin-bottom: 32px;">Thank you for signing up, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla fringilla vel sapien ac pellentesque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In varius consequat mauris ac molestie. Etiam tincidunt porttitor accumsan. Aliquam ultricies rutrum pretium.</p>
                <p style="margin-bottom: 0px;">Cheers,</p>
                <h3 style="margin-top: 3px;">DataPrivacyRights.Com</h3>
                <a style="text-decoration: none;" href="${link}">
                  <h3 style="color: white;text-align: center;background-color: #f1521b;display: block;padding: 10px 30px;margin: 0px;margin-top:48px;">GET STARTED</h3>
                </a>
              </td>
            </tr>
          </table>`
        }
        
        callback(null, mailOptions, encodedUserKey, key);
      },
      (mailData, userKey, secretKey, callback) => {
        sendGrid.sendMail(mailData);
        redisClient.set('users:' + userKey, secretKey);
        redisClient.set('keys:' + secretKey, user.id);
        redisClient.expire('users:' + userKey, 3600000); // setting expiry for 10 minutes.
        redisClient.expire('keys:' + secretKey, 3600000); // setting expiry for 10 minutes.
        callback(null, "Email sent Successfully");
      }
    ], (err, data) => {
      return ({ error: err === null ? false : true, data: data });
    });
  },
  SignDownloadKey: (sAssetLink, sExt, sFileName, sCaseID) => {
    let downloadKey = cryptoServices.generateRandomString();
    let sKey = `attachments:signature:${downloadKey}`;
    redisClient.set(sKey, JSON.stringify({
      link: sAssetLink,
      ext: sExt,
      caseid: sCaseID,
      filename: sFileName,
    }));
    redisClient.expire(sKey, secretKeyDuration);
    return downloadKey;
  },
  /**
   * Gets info from Redis
   * @param string sSignature | download signature
   * @param function fCallback 
   */
  GetDownloadInfo: (sSignature, fCallback) => {
    let sKey = `attachments:signature:${sSignature}`;
    return redisClient.get(sKey, (err, data) => {
      if (err) {
        return fCallback(err, null);
      }
      try {
        // parse back the value into object form since redis only accepts string.
        return fCallback(null, JSON.parse(data));        
      } catch (error) {
        // make a safe catch for some cases.
        console.error(error);
        return fCallback(null, null);
      }
    })
  }
}