const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const { HTTP_PORT, braintree } = require('./server/config/config.json');

const PORT = HTTP_PORT;
// Set up the express app
const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Request-Headers", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  next();
});

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({  extended: false}));

require('./server/routes')(app);
// Setup a default catch-all route that sends back a welcome message in JSON format.
app.get('*', (req, res) => {
  console.log(req.ip, req.headers);
  return res.status(200).send({
    message: 'Welcome to the beginning of nothingness.',
  })
});

app.post('*', (req, res) => {
  console.log(req.ip, req.headers);
  console.log(req.body);
});

app.listen(PORT, () => {
  console.log('listening to port', PORT)
});
