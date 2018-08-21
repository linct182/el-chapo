const client = require('@sendgrid/client');
const api_key = require('../config/config.json')['send-grid'];

client.setApiKey(api_key);

module.exports = {
  testEmail(req, res){
    const body = req.body;

    const request = {
      method: 'POST',
      url: '/v3/mail/send',
      body
    };

    client.request(request)
      .then(([response, body]) => {
        console.log(response, body);
        res.send(response);
      })
      .catch(error => {
        console.log(error);
        res.send(error);
      });
  },
  sendMail(data) {
    
    let body = {
      "personalizations": [{
        "to": [{ "email": data.email_to, "name": data.name_to }]
      }],
      "from": { "email": data.email_from, "name": data.name_from },
      "subject": data.subject,
      "content": [{
        "type": "text/html",
        "value": data.content
      }]
    }
    
    const request = {
      method: 'POST',
      url: '/v3/mail/send',
      body
    };
    
    return client.request(request)
      .then(([response, body]) => {
        return 'Email sent successfully';
      })
      .catch(error => {
        console.log('-----------------------Error Sending email', error);
        return 'Error sending an email';
      });
  }
}
