const Redis = require('../services/redis');
module.exports = {
    IsAttachmentValid(req, res, next) {
        return Redis.GetDownloadInfo(req.params.signature, (err, data) => {
            if (err) {
                console.error(err);
                return res.status(400).send('There is an error while fetching download metadata');
            }

            // this means that the link is invalid or the signature has already been expired.
            if (data === null || !data) {
                return res.status(400).send('The link is either invalid or expired');
            }

            req.attachment = data;
            req.body.caseID = data.caseid;
            next();
        });
    },

}