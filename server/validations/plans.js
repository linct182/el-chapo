const Joi = require('joi');
module.exports = {
    ValidatePlan: (req, res, next) =>  {
        const schema = Joi.object().keys({
            title: Joi.string().min(1).max(30).required(),
            description: Joi.string().min(1).max(255).required(),
            amount: Joi.number().positive().min(0.001).max(9999).required(),
            min: Joi.number().min(0).max(10000).required(),
            max: Joi.number().min(0).max(10000).required(),
            id: Joi.number().positive().optional()
        });
        return Joi.validate(req.body, schema, { abortEarly: false }, (err, values) => {
            if (err) {
                return res.send(err);
            }
            return next();
        })
    }
}