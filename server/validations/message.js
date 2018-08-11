const Joi = require('joi');

module.exports = {
    VerifyMessage: (req, res, next) => {
        const schema = Joi.object().keys({
            // email: Joi.string().email().required(),
            // message: Joi.string().min(5).max(1000).required(),
            // name: Joi.string().min(2).max(64).required(),
            // subject: Joi.string().min(2).max(64).required()
            email: Joi.string().required(),
            message: Joi.string().required(),
            name: Joi.string().required(),
            subject: Joi.string().required()
        });
        return Joi.validate(req.body, schema, {abortEarly: false}, (err, data) => {
            if (err) {
                return res.send(err);
            }
            return next();
        })
    }
}
