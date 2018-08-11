const Email = require('../services/email');

module.exports = {
    SendMessage: async (req, res) => {
        const result = await Email.SendThankYouLetter(req.body.email, req.body.name);
        Email.SendAdminMessage(req.body.email, req.body.message, req.body.name, req.body.subject);
        return res.status(200).send(result);
    }
}