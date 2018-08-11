const Cases = require('../models/index').cases;
const sequelize = require('sequelize');
const config = require('../config/config.json');
module.exports = {
    /**
     * Returns 403 if the user is not an agent
     */
    IsClient: (req, res, next) => {
        if (req.user.user_type_id !== 2) {
            return res.status(403).send({
                message: 'Clients only'
            });
        }
        next();
    },
}