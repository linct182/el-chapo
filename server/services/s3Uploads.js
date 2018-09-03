const promise = require('bluebird');
const AWS = require('aws-sdk');
const config = require('../config/config.json');
const crypto = require('./crypto');
const s3 = promise.promisifyAll(new AWS.S3());
const fs = require('fs');
const READER = promise.promisify(fs.readFile);
const contentType = require('mime-types');

// const PUTOBJ = promise.promisify(s3.putObject);

/**
 * Uploads file to Amazon S3
 * @param {string} caseId 
 * @param {string} sFileName 
 * @param {string} sPath 
 * @param {function} fCallback 
 */
const S3Upload = (caseId, sFileName, sPath, ext, fCallback) => {
    return fs.readFile(sPath, {}, (err, contents) => {
        // separated code for debugging purposes
        let sCaseID = crypto.generateS3KeyByUserID(caseId);
        return s3.putObjectAsync({
            Bucket: config.s3UploadsBucketName,
            Key: `${sCaseID}/${sFileName}`,
            ContentType: contentType.lookup(ext),
            Body: contents,
            ACL: 'public-read'
        }).then(() => {
            return fCallback(null, true)
        }).catch((err) => {
            return fCallback(err, false)
        })
    });
}

const S3Download = (sFileName, fCallback) => {

    var params = {
        Bucket: config.s3UploadsBucketName,
        Key: `${sFileName}`,
    };

    s3.headObject(params, function (err, data) {
        if (err) {
            // an error occurred
            // console.error(err);
            return fCallback(err, null);
        }
        
        return fCallback(null, {
            stream: s3.getObject(params).createReadStream(),
            info: data
        });

    });
}

module.exports = {
    S3Upload: promise.promisify(S3Upload),
    S3Download: promise.promisify(S3Download)
}