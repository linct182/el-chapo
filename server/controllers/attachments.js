const Attachments = require('../models/index').attachments;
const Cases = require('../models/index').cases;
const Users = require('../models/index').users;
const crypto = require('../services/crypto');
const config = require('../config/config.json');
const redisService = require('../services/redis');
const mime = require('mime-types');
const S3 = require('../services/s3Uploads');

module.exports = {
    GetAttachments: (req, res) => {
        // check the ids.
        return Attachments.findAll({
            where: {
                case_uuid: req.params.caseid,
            },
            order: [['id', 'ASC']],
        }).then((data) => {
            let sCaseID = crypto.generateS3KeyByUserID(req.params.caseid);
            // render all the mapped data.
            let BASEURL = config.upload_base_url;
            if (typeof req.query.short !== 'undefined') {
                BASEURL = '';
            }

            let aData = data.map((v, i) => {
                let sSignature = redisService.SignDownloadKey(`${sCaseID}/${v.link}`, v.file_type, v.file_name, req.params.caseid);
                let sLink = v.link.split('.')[0];
                return {
                    link: `${BASEURL}/${sLink}/${sSignature}`,
                    type: v.file_type,
                    file_name: v.file_name,
                }
            });

            return res.send(aData);
        });
    },
    DownloadAttachment(req, res) {
        let sent = false;
        // console.log(req.attachment);
        return S3.S3Download(req.attachment.link).then((resp) => {
            // forward errors
            resp.stream.on('error', function error(err) {
                //continue to the next middlewares
                console.error(err);
                if (sent === false) {
                    sent = true;
                    return res.status(400).send('There is an error obtaining attachment');
                }
            });

            //Add the content type to the response (it's not propagated from the S3 SDK)
            res.header('Content-Type', mime.lookup(req.attachment.ext));

            res.header('Content-Length', resp.info.ContentLength);
            res.header('Last-Modified', resp.info.LastModified);
            res.header('ETag', resp.info.ETag);

            // if the download marker is true
            if (req.query.dl === 'yes') {
                res.header('Content-Disposition', `attachment; filename="${req.attachment.filename}"`);
            }

            resp.stream.on('end', () => {
                console.log('Served by Amazon S3: ');
            });

            //Pipe the s3 object to the response
            resp.stream.pipe(res);
        }).catch((err) => {
            console.error(err);
            if (sent === false) {
                sent = true;
                return res.status(400).send('There is an error obtaining attachment');
            }
        });
  

       
    }
}