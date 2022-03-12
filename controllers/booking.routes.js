const router = require('express').Router();
const authenticate = require('./../middleware/authenticate');
const userModel = require('./../models/user.model');
const roomModel = require('./../models/room.model');
const sender = require('./../config/nodemailer.config');

function bookMailRenter(details) {
    return {
        from: 'Room Finder<noreply@abcd.com>',
        to: details.email,
        subject: 'You have book a room',
        text: 'You have booked a room',
        html: `<p>Hi <strong>${details.name}</strong><p>
        <p>We noticed that you have booked a room</p>
        <p>Landlord phone number is ${details.phone}</p>`
    }
}

function bookMailLandlord(details) {
    return {
        from: 'Room Finder<noreply@abcd.com>',
        to: details.email,
        subject: 'Your room is booked',
        text: 'Your Room is booked',
        html: `<p>Hi <strong>${details.name}</strong><p>
        <p>We noticed that your room is booked</p>
        <p>Renter phone number is ${details.phone}</p>`
    }
}

router.route('/')
    .get((req, res, next) => {
        roomModel.findById(req.loggedInUser.book)
            .exec((err, bookedRoom) => {
                if (err)
                    return next(err);
                res.send(bookedRoom);
            })
    })
    .delete((req, res, next) => {
        req.loggedInUser.book = null;
        req.loggedInUser.save((err, saved) => {
            if (err)
                return next(err);
            res.send(saved);
        })
    })

router.route('/:id')
    .put(authenticate, (req, res, next) => {
        roomModel.findById(req.params.id)
            .populate('user')
            .exec((err, done) => {
                if (err)
                    return next(err);
                console.log(req.loggedInUser.book)
                if (!req.loggedInUser.book) {
                    return next({ message: 'Already Booked, You can Book Only One Room' });
                }
                req.loggedInUser.book = req.params.id;
                console.log('data',req.loggedInUser);
                console.log('daataa',done.user);
                req.loggedInUser.save((err, saved) => {
                    if (err)
                        return next(err);
                    var renterMail = bookMailRenter({
                        email: req.loggedInUser.email,
                        name: req.loggedInUser.name,
                        phone: req.loggedInUser.phone
                    })
                    var landlordMail = bookMailLandlord({
                        email: done.user.email,
                        name: done.user.name,
                        phone: done.user.phone
                    })
                    sender.sendMail(renterMail, (err, done) => { });
                    sender.sendMail(landlordMail, (err, done) => { });
                    res.send(saved);
                })
            })
    })

module.exports = router;