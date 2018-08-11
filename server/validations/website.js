const Websites = require('../models/index').websites;

module.exports = {
    /**
     * Only Preloads website
     */
    IsValidWebsiteID: (req, res, next) => {
        if (!req.body.websiteID) {
            return res.status(400).send('Invalid Website Request');
        }

        return Websites.findOne({
            where: {
                id: req.body.websiteID,
            }
        }).then((websiteInfo) => {
            if (!websiteInfo) {
                return res.status(400).send('Invalid Website Request');
            }
            req.website = websiteInfo;
            req.body.caseID = websiteInfo.case_uuid;
            return next();
        }).catch((err) => {
            console.error(err);
            return res.status(400).send('Invalid Website Request');
        })
    }
}
