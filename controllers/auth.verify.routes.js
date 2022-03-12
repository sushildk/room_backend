const router = require('express').Router();

const sender = require('./../config/nodemailer.config');

function verifyEmail(details) {
    return {
        from: 'Room Finder<noreply@abcd.com>',
        to: details.email,
        subject: 'Verify Email✔',
        text: 'Verify Email✔',
        html: `<p>Hi, <strong>${details.name}</strong></p>
        <p>Verify your email to become our trusted membemr. Use link below to verify your email address</p>
        <p><a href="${details.verifyLink}" target="_blank">Verify Email</a></p>
        <p>If you did not suscribe our website, use the link below to unscribe it.</p>
        <p><a href="${details.deleteLink}" target="_blank">Unsuscribe</a></p>`
    }
}

module.exports = router;