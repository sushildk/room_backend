const nodeMailer = require('nodemailer');
module.exports = nodeMailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'sg.emailsender@gmail.com',
        pass: 'testEmail'
    }
});