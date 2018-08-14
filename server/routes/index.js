const usersController = require('../controllers').users;
const productsController = require('../controllers').products;
const newsController = require('../controllers').news;


const userTypesController = require('../controllers').userTypes;
const paymentUserController = require('../controllers').paymentuser;
const customersController = require('../controllers').customers;
const plansController = require('../controllers').case_plans;
const attachmentsController = require('../controllers').attachments;
const agentWebsiteController = require('../controllers').websites
const casesController = require('../controllers').cases;
const agentController = require('../controllers').agents;
const billingController = require('../controllers').payments;
const feedbackController = require('../controllers').feedbacks;
const messagesController = require('../controllers').message;
const paidCasesController = require('../controllers').paymentcases;
const paymentRequestController = require('../controllers').paymentrequests;
const analyticsController = require('../controllers').analytics;

const VERSION = require('../config/config.json').version;
const agentCasesController = require('../controllers').agentcases;

const passportService = require('../services/passport');
const captchaService = require('../services/captcha');
const passport = require('passport');
const multer = require('multer');
// const redisServices = require('../services/redis');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

const testers = require('./testers');
const references = require('./testers');

const AgentValidators = require('../validations/agent');
const AdminValidators = require('../validations/admin');
const WebsiteValidators = require('../validations/website');
const CustomerValidators = require('../validations/customer');
const CasesValidators = require('../validations/cases');
const FeedbackValidators = require('../validations/feedbacks');
const AttachmentsValidators = require('../validations/attachments');
const PlansValidators = require('../validations/plans');
const MessageValidators = require('../validations/message');

module.exports = (app) => {
  references(app),
  testers(app),
  
  app.get('/', requireAuth, (req, res) => {
    res.status(req.user.user_type_id !== 2 ? 200 : 401).send({ hi: parseInt(req.user.user_type_id) !== 2 ? 'Welcome' : 'No access' });
  });

  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the Todos API!',
  }));


  // START NG GAMIT NATIN NA API MAC

  //Users
  app.post('/admin/registration', requireAuth, usersController.createAdmin);
  app.post('/admin/signin', requireSignin, usersController.signIn);

  // Products
  app.get('/products/details/:id', productsController.getProductDetails);
  app.get('/products/list', productsController.listProducts);
  app.get('/products/promos', productsController.listPromos);
  app.post('/products/add', requireAuth, productsController.addProduct);
  app.post('/products/update/:id', requireAuth, productsController.updateProduct);
  app.get('/products/delete/:id', requireAuth, productsController.deleteProduct);

  // News
  app.post('/news/add', requireAuth, newsController.addNews);
  // END NG GAMIT NATIN NA API MAC







  // app.get('/list/users/:userTypeId', requireAuth, AdminValidators.IsAdmin, userTypesController.listCustomers)
  app.get('/profile', requireAuth, usersController.GetProfile);


  app.post('/list/users', requireAuth, AdminValidators.IsAdmin, usersController.listCustomers);
  // app.get('/users/verify/:user/:key', redisServices.verifyLink);
  app.post('/users/contactus', usersController.contactUs);
  
  app.get('/customer/uploadkey', requireAuth, customersController.getUploadKey);
  app.post('/customer/submitcase', requireAuth, customersController.createCase);

  // IF this user can feedback on the case, then he/she can upload on the said case
  app.post('/customer/caseuploads/:caseid', requireAuth, FeedbackValidators.IsUserAllowedToFeedback, customersController.uploadCaseAttachments);
  app.get('/customer/cases', requireAuth, customersController.listCustomerCases);
  app.get('/customer/case/:caseid', requireAuth, customersController.getCaseDetails);

  app.post('/customer/case/confirm', requireAuth, CustomerValidators.IsClient, CasesValidators.IsCaseForConfirmation, casesController.ConfirmCase);

  // Agents
  app.post('/agent/registration', captchaService.verify, usersController.registerAgent);

  app.get('/health', (req, res) => {
    console.log(req.cookies);
    return res.status(200).send({
    // Admin
      message: 'OK',
      appInfo: VERSION
    })
});
  app.get('/refresh', requireAuth, usersController.refreshToken);
  // gets attachmetns by case
  app.get('/attachments/:caseid', requireAuth, FeedbackValidators.IsUserAllowedToFeedback, attachmentsController.GetAttachments);
  // gets attachment by file ID and signature.
  app.get('/attachments/download/:fileID/:signature', AttachmentsValidators.IsAttachmentValid, attachmentsController.DownloadAttachment);
  app.get('/payments/generate-auth-token', requireAuth, paymentUserController.GenerateTestToken);
  app.get('/case/websites/:caseid', requireAuth, FeedbackValidators.IsUserAllowedToFeedback, agentWebsiteController.GetWebsites);
  
  // Plans
  app.get('/case-plans', plansController.ListCases);
  app.post('/admin/case-plans/new', requireAuth, AdminValidators.IsAdmin, PlansValidators.ValidatePlan, plansController.CreatePlan);
  app.post('/admin/case-plans/delete', requireAuth, AdminValidators.IsAdmin, plansController.RemovePlan);
  app.post('/admin/case-plans/update', requireAuth, AdminValidators.IsAdmin, PlansValidators.ValidatePlan, plansController.UpdateCasePlans);
  // app.post('/payments/pay', paymentUserController.StartTransaction);
  app.post('/webhooks/braintree/disbursement', paymentUserController.SaveWebHook, paymentUserController.ReceiveDisbursement);
  app.post('/webhooks/paypal', paymentUserController.SaveWebHook, paymentUserController.ReceivePaypalWebHook);
  app.post('/webhooks/paypal-refund', paymentUserController.SaveWebHook, paymentUserController.PaypalRefundWebHook);
  app.post('/webhooks/braintree/test', paymentUserController.CreateTestWebhook);
  app.post('/webhooks/braintree/transaction', paymentUserController.GetTransactionInfo);

  app.post('/contact/send-message', captchaService.verify, MessageValidators.VerifyMessage, messagesController.SendMessage);

  app.get('/admin/revenues', requireAuth, AdminValidators.IsAdmin, analyticsController.GetMonthlySales);
  
// console.log(Object.keys(paidCasesController));
  app.post('/admin/payouts/approve', requireAuth, AdminValidators.IsAdmin, paidCasesController.SetAsPaid, paymentRequestController.SetAsPaid, agentController.GetAgentInfo, paymentRequestController.SendApprovalEmail);
  
  app.get('/admin/options/show-years', requireAuth, AdminValidators.IsAdmin, analyticsController.ExtractYear);

  // Cases
  app.get('/agent/cases/count', requireAuth, AgentValidators.IsAgent, agentCasesController.CountAll);
  // Get Active case
  app.get('/agent/case/active', requireAuth, AgentValidators.IsAgent, agentCasesController.GetActiveCase);
  // opens a case
  app.post('/agent/cases/open', requireAuth, AgentValidators.IsAgent, AgentValidators.HasActiveCase, agentCasesController.GetLastCase, agentCasesController.OpenCase);
  // updates a case to 3
  app.post('/agent/cases/unresolve', requireAuth, FeedbackValidators.IsUserAllowedToFeedback, agentCasesController.ReopenCase);
  // closes a case
  app.post('/agent/cases/resolve', requireAuth, AgentValidators.IsAgent, AgentValidators.IsCaseOwnedByAgent, CasesValidators.AreWebsitesClosed, agentCasesController.ResolveCase);
  
  // gets agent case history
  app.get('/agent/cases/history', requireAuth, AgentValidators.IsAgent, agentCasesController.GetAgentCasesHistory);

  // gets agent case payouts
  app.post('/agent/cases/payouts', requireAuth, AgentValidators.IsAgent, agentCasesController.GetAgentCasePayouts);

  // agent payout request
  app.post('/agent/payout/request', requireAuth, AgentValidators.IsAgent, agentCasesController.AgentRequestPayout);

  // gets history of a case
  app.get('/agent/cases/:caseID/history', requireAuth, AgentValidators.IsAgent, agentCasesController.GetCaseHistory);
  app.get('/agent/case/:caseID', requireAuth, AgentValidators.IsAgent, AgentValidators.IsCaseOwnedByAgent, customersController.getCaseDetails);
  
  // app.get('/agent/')
  app.post('/agent/websites/set-status', requireAuth, AgentValidators.IsAgent, WebsiteValidators.IsValidWebsiteID, AgentValidators.IsCaseOwnedByAgent, agentWebsiteController.SetWebsiteAsActive);

  // admin get list of agents that are not activated
  app.get('/admin/agents/pending', requireAuth, AdminValidators.IsAdmin, agentController.ListPending);

  // Active agent
  app.post('/admin/user/activate', requireAuth, AdminValidators.IsAdmin, agentController.Activate);

  // Get all cases / filterable by paid or not.
  app.post('/admin/billing/cases', requireAuth, AdminValidators.IsAdmin, paidCasesController.GetCases);

  // Get all payouts.
  app.post('/admin/payouts', requireAuth, AdminValidators.IsAdmin, paymentRequestController.ListRequests);

  // creates a payout
  app.post('/agents/payouts/create', requireAuth, AgentValidators.IsAgent, paidCasesController.CreatePayoutRequest);

  // Deactivate agent
  app.post('/admin/user/deactivate', requireAuth, AdminValidators.IsAdmin, agentController.Deactivate);

  // Get Billings By default this month only.
  app.get('/admin/payments', requireAuth, AdminValidators.IsAdmin, billingController.ShowList);

  // Counts billings this month
  app.get('/admin/payments/total', requireAuth, AdminValidators.IsAdmin, billingController.ShowTotalIncome);

  // Feedbacks
  app.post('/feedbacks/create', requireAuth, FeedbackValidators.VerifyFeedbackForm, FeedbackValidators.IsUserAllowedToFeedback, feedbackController.CreateFeedback);

  app.post('/feedbacks/delete', requireAuth, FeedbackValidators.IsUserAllowedToFeedback, feedbackController.RemoveFeedback);

  app.get('/feedbacks/:caseid', requireAuth, FeedbackValidators.IsUserAllowedToFeedback, feedbackController.LoadFeedbacks);
  // admin 
  app.post('/admin/feedbacks/delete', requireAuth, AdminValidators.IsAdmin, feedbackController.RemoveFeedback);

  // admin get counts
  app.get('/admin/stats', requireAuth, AdminValidators.IsAdmin, casesController.CountCases);
};
