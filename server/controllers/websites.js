const Websites = require('../models/index').websites;
const Joi = require('joi');
const CaseLog = require('../models/index').case_logs;
const Status = require('../models/index').website_status;

module.exports = {
    /**
     * Sets a website as active
     * accepts body @status @websiteID
     */
    SetWebsiteAsActive: (req, res, next) => {
        if (parseInt(req.body.status) === 0 || !req.body.status) {
            return res.status(400).send({
                message: 'invalid status'
            });
        }
        return Websites.update({
            status_id: req.body.status,
        }, {
            where: {
                id: req.body.websiteID,
            }
        }).then((d) => {
            return res.send('ok');
        }).catch((err) => {
            console.error(err);
            return res.status(400).send({
                message: 'invalid parameters'
            })
        });
    },
    GetWebsites: (req, res, next) => {
        let oJoin = [{
            model: Status,
            as: 'status',
            attributes: ['id', 'name', 'description']
        }];
        if (req.query.short === true) {
            let oJoin = null;
        }

        return Websites.findAll({
            where: {
                case_uuid: req.params.caseid,
            },
            order: [['id', 'ASC']],
            include: oJoin
        }).then((data) => {
            return res.send(data);
        }).catch((err) => {
            console.error(err);
            return res.status(400).send('There is an error while loading websites');
        });
    }
}
