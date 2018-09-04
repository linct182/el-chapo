const Email = require('../services/email');
const Settings = require('../models').settings;

module.exports = {
    SendMessage: async (req, res) => {
        return Settings
            .findOne({
                where: { title: 'settings-1' }
            })
            .then(async (settings) => {

                if (!settings) {
                    return res.status(404).send({
                        message: 'Settings Not Found',
                    });
                }
            
                const mailData = {
                    admin_email: settings.admin_email,
                    email: req.body.email,
                    contact_no: req.body.contact_no,
                    address: req.body.address,
                    name: req.body.name,
                    subject: req.body.subject,
                    message: req.body.message
                }

                const result = await Email.SendThankYouLetter(req.body.email, req.body.name);
                Email.SendAdminMessage(mailData);
                return res.status(200).send(result);
        })
        .catch((error) => res.status(400).send(error));
    }
}