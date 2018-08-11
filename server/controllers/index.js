const todos = require('./todos');
const todoItems = require('./todoItems');
const users = require('./users');
const userTypes = require('./user_types');
const case_plans = require('./plans');
const cases = require('./cases');
const attachments = require('./attachments');
const websites = require('./websites');
const agentcases = require('./agentcases');
const agents = require('./agents');
const payments = require('./payments');
const feedbacks = require('./feedbacks');
const message = require('./message');
const paymentcases = require('./paymentcases');
const paymentrequests = require('./paymentrequests');
const analytics = require('./analytics');

const paymentuser = require('./paymentuser');
const customers = require('./customers');

module.exports = {
  todos,
  todoItems,
  users,
  userTypes,
  paymentuser,
  customers,
  case_plans,
  cases,
  attachments,
  agentcases,
  websites,
  agents,
  payments,
  feedbacks,
  message,
  paymentcases,
  paymentrequests,
  analytics
};