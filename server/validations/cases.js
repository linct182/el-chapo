const Cases = require('../models/index').cases;
const Websites = require('../models/index').websites;
const sequelize = require('sequelize');

module.exports = {
    IsCaseForConfirmation(req, res, next) {
        if(!req.body.caseID) {
            return res.status(400).send('invalid');
        }
        Cases.findOne({
            where: {
                case_uuid: req.body.caseID,
                customer_id: req.user.id,
            }
        }).then((data) => {
            if (data === null) {
                return res.status(400).send({
                    success: false
                });
            }
            if (data.dataValues.status_id === 4) {
                req.caseInfo = data.dataValues;
                return next();
            }
            return res.status(400).send({
                success: false
            });
        }).catch((err) => {
            console.err(err);
            res.status(400).send('There is an error with your request');
        })
    },
    IsCaseValid(req, res, next) {
        if (!parseInt(req.body.caseID)) {
            return res.status(400).send('invalid');
        }

        Cases.findOne({
            where: {
                case_uuid: req.body.caseID
            }
        }).then((data) => {
            
            req.case = data.dataValues;

            return next();

        }).catch((err) => {
            console.error(err);
            req.status(400).send('Invalid Case ID')
        });
    },
    AreWebsitesClosed(req, res, next) {
        // conidering that the case is valid, given by the previous validation
        return Websites.findOne({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('case_uuid')), 'count']
            ],
            where: {
                case_uuid: req.case.case_uuid,
                status_id: {
                    [sequelize.Op.not]: 3,
                }
            }
        }).then((data) => {
            if (parseInt(data.dataValues.count) === 0) {
                console.log('hello');
                return next();
            }
            
            console.log('there is some kind of error');
            return res.status(400).send({
                sucess:false,
                count: parseInt(data.dataValues.count)
            });

        }).catch((err) => {
            console.error(err);
            return res.status(400).send({
                success: false,
            });
        })
    }
}