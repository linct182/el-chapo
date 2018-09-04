const sendGrid = require('../services/sendgrid');
const email_banner = require('../config/config.json')['email_banner'];
const emailFrom = require('../config/config.json')['email_from'];
const emailAdmin = require('../config/config.json')['email_admin'];
const emailNoReply = require('../config/config.json')['email_no_reply'];

module.exports = {
    sendConfirmation(user, host) {
        let mailData = {
            email_to: user.email,
            name_to: `${user.forename} ${user.surname}`,
            email_from: emailAdmin,
            name_from: emailFrom,
            subject: 'Agent Registration',
            content: `
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
              <td><img src="${email_banner}" alt="DataPrivacyRights" width="600" height="auto" style="display: block;" /></td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 40px; border: 1px solid #cacaca;">
                <h3>Hi ${user.forename} ${user.surname},</h3>
                <p style="margin-bottom: 32px;">Thank you for signing up<br /> You account will be reviewed by the Administrator.<br />An email will be sent to once you are approved as an agent. <br />Thanks you!</p>
                <p style="margin-bottom: 0px;">Cheers,</p>
                <h3 style="margin-top: 3px;">${emailFrom}</h3>
              </td>
            </tr>
          </table>`
        };
        return sendGrid.sendMail(mailData);
    },
    SendActivationLetter(user, host) {
      let mailData = {
        email_to: user.email,
        name_to: `${user.forename} ${user.surname}`,
        email_from: emailFrom,
        name_from: 'DataPrivacyRights',
        subject: 'Agent Registration',
        content: `
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
              <td><img src="${email_banner}" alt="DataPrivacyRights" width="600" height="auto" style="display: block;" /></td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 40px; border: 1px solid #cacaca;">
                <h3>Hi ${user.forename} ${user.surname},</h3>
                <p style="margin-bottom: 32px;">Your account is now activated.</p>
                <p style="margin-bottom: 0px;">Cheers,</p>
                <h3 style="margin-top: 3px;">DataPrivacyRights.Com</h3>
              </td>
            </tr>
          </table>`
      };
      return sendGrid.sendMail(mailData);
    },
    SendThankYouLetter(sEmail, sName) {
        let mailData = {
        email_to: sEmail,
        name_to: sName,
        email_from: emailAdmin,
        name_from: emailFrom,
        subject: 'Thank you message',
        content: `
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
              <td bgcolor="#ffffff" style="padding: 40px; border: 1px solid #cacaca;">
                <h3>Hi, ${sName}</h3>
                <p style="margin-bottom: 32px;">Thank you for sending a message! We will respond as soon as possible.</p>
                <p style="margin-bottom: 0px;">Cheers,</p>
                <h3 style="margin-top: 3px;">${emailFrom}</h3>
              </td>
            </tr>
          </table>`
      };
      return sendGrid.sendMail(mailData);    
    },
  // SendThankYouLetter(sEmail, sName) {
  //   let mailData = {
  //     email_to: sEmail,
  //     name_to: sName,
  //     email_from: emailNoReply,
  //     name_from: 'DataPrivacyRights',
  //     subject: 'Thank you message',
  //     content: `
  //         <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
  //           <tr>
  //             <td><img src="${email_banner}" alt="DataPrivacyRights" width="600" height="auto" style="display: block;" /></td>
  //           </tr>
  //           <tr>
  //             <td bgcolor="#ffffff" style="padding: 40px; border: 1px solid #cacaca;">
  //               <h3>Hi, ${sName}</h3>
  //               <p style="margin-bottom: 32px;">Thank you for sending a message! We will respond as soon as possible.</p>
  //               <p style="margin-bottom: 0px;">Cheers,</p>
  //               <h3 style="margin-top: 3px;">DataPrivacyRights.Com</h3>
  //             </td>
  //           </tr>
  //         </table>`
  //   };
  //   return sendGrid.sendMail(mailData);
  // },
    SendMessage(sEmailTo, sMessage, sName, sSubject) {
      let mailData = {
        email_to: sEmailTo,
        name_to: sName,
        email_from: emailNoReply,
        name_from: 'DataPrivacyRights',
        subject: sSubject,
        content: `
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
              <td><img src="${email_banner}" alt="DataPrivacyRights" width="600" height="auto" style="display: block;" /></td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 40px; border: 1px solid #cacaca;">
                <h3>Hi, ${sName}</h3>
                <p style="margin-bottom: 32px;">${sMessage}</p>
                <p style="margin-bottom: 0px;">Cheers,</p>
                <h3 style="margin-top: 3px;">DataPrivacyRights.Com</h3>
              </td>
            </tr>
          </table>`
      };
      return sendGrid.sendMail(mailData);
    },
    SendContactUsMessage(sEmailTo, sMessage, sName, sSubject) {
      let mailData = {
        email_to: sEmailTo,
        name_to: sName,
        email_from: emailNoReply,
        name_from: 'DataPrivacyRights',
        subject: sSubject,
        content: `
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
              <tr>
                <td><img src="${email_banner}" alt="DataPrivacyRights" width="600" height="auto" style="display: block;" /></td>
              </tr>
              <tr>
                <td bgcolor="#ffffff" style="padding: 40px; border: 1px solid #cacaca;">
                  <h3>Hi, ${sName}</h3>
                  <p style="margin-bottom: 32px;">${sMessage}</p>
                  <p style="margin-bottom: 0px;">Cheers,</p>
                  <h3 style="margin-top: 3px;">DataPrivacyRights.Com</h3>
                </td>
              </tr>
            </table>`
      };
      return sendGrid.sendMail(mailData);
    },
  SendAdminMessage({ admin_email, email, contact_no, address, name, subject, message }) {
      let mailData = {
        email_to: admin_email,
        name_to: 'Admin',
        email_from: email,
        name_from: name,
        subject: subject,
        content: `
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
              <td bgcolor="#ffffff" style="padding: 40px; border: 1px solid #cacaca;">
                <h3>Hi, Admin</h3>
                <p>${email} sent a message containing:</p>
                <p style="margin-bottom: 32px;">${message}</p>
                <p style="margin-bottom: 0px;">Cheers,</p>
                <h3 style="margin-top: 3px;">${name}</h3>
                <p>Contact no: <span style="color: #0000EE">${contact_no}</span></p>
                <p>Address:  <span style="color: #0000EE">${address}</span></p>
              </td>
            </tr>
          </table>`
      };
      
      return sendGrid.sendMail(mailData);      
    },
  // SendAdminMessage(sEmailFrom, sMessage, sName, sSubject) {
  //   let mailData = {
  //     email_to: emailAdmin,
  //     name_to: sName,
  //     email_from: emailNoReply,
  //     name_from: 'DataPrivacyRights',
  //     subject: sSubject,
  //     content: `
  //         <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
  //           <tr>
  //             <td><img src="${email_banner}" alt="DataPrivacyRights" width="600" height="auto" style="display: block;" /></td>
  //           </tr>
  //           <tr>
  //             <td bgcolor="#ffffff" style="padding: 40px; border: 1px solid #cacaca;">
  //               <h3>Hi, Admin</h3>
  //               <p>${sName} (${sEmailFrom}) sent a message containing:</p>
  //               <p style="margin-bottom: 32px;">${sMessage}</p>
  //               <p style="margin-bottom: 0px;">Cheers,</p>
  //               <h3 style="margin-top: 3px;">DataPrivacyRights.Com</h3>
  //             </td>
  //           </tr>
  //         </table>`
  //   };
  //   return sendGrid.sendMail(mailData);
  // }
}
