const Joi = require('joi');
const Cases = require('../models/index').cases;

module.exports = {
    VerifyFeedbackForm(req, res, next) {
        const schema = Joi.object().keys({
            caseID: Joi.string().uuid().required(),
            feedback: Joi.string().min(5).max(1000).required(),
        });
        Joi.validate(req.body, schema, { abortEarly: false }, (err, values) => {
            if (err) {
                return res.send(err);
            }

            return next();
        });
    },
    IsUserAllowedToFeedback(req, res, next) {
        // check if this user is allowed to post a feedback
        let sCaseID = req.body.caseID;
        if (!sCaseID) {
            sCaseID = req.params.caseid;
        }

        if (!sCaseID) {
            return res.status(403).send('You are not allowed to do this action');
        }

        return Cases.findOne({
            where: {
                case_uuid: sCaseID,
            }
        }).then((data) => {
            // check if user id is in either agent id
            if (req.user.id === data.dataValues.customer_id || req.user.id === data.dataValues.agent_id) {
                return next();
            }
            return res.status(403).send('You are not allowed to do this action');
        }).catch((err) => {
            console.error(err);
            return res.status(400).send('There is an error when checking permissions');
        });
    }
}