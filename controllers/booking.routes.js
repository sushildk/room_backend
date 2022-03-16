const router = require("express").Router();
const authenticate = require("./../middleware/authenticate");
const userModel = require("./../models/user.model");
const roomModel = require("./../models/room.model");
const sender = require("./../config/nodemailer.config");

function bookMailRenter(details) {
  return {
    from: "Room Finder<noreply@abcd.com>",
    to: details.email,
    subject: "You have book a room",
    text: "You have booked a room",
    html: `<p>Hi <strong>${details.name}</strong><p>
        <p>We noticed that you have booked a room</p>
        <p>Landlord phone number is ${details.phone}</p>`,
  };
}

function bookMailLandlord(details) {
  return {
    from: "Room Finder<noreply@abcd.com>",
    to: details.email,
    subject: "Your room is booked",
    text: "Your Room is booked",
    html: `<p>Hi <strong>${details.name}</strong><p>
        <p>We noticed that your room is booked</p>
        <p>Renter phone number is ${details.phone}</p>`,
  };
}

router.route("/").get((req, res, next) => {
  roomModel
    .find({ booked: true })
    .populate("bookedUser")
    .exec((err, rooms) => {
      if (err) {
        return next({ message: "Cannot get booked room, try again" });
      }
      res.json({ room: rooms });
    });
});

router
  .route("/:id")
  .get(authenticate, (req, res, next) => {
    if (req.loggedInUser.bookRoom) {
      return next({
        message: "you have already book a room, you can not book any more room",
      });
    }
    roomModel.findById(req.params.id).exec((err, room) => {
      if (err) return next(err);
      if (room) {
        room.bookedUser = req.loggedInUser._id;
        room.booked = true;
        room.save((err, room) => {
          if (err) return next(err);
          if (room) {
            var renterMail = bookMailRenter({
              email: req.loggedInUser.email,
              name: req.loggedInUser.name,
              phone: req.loggedInUser.phone,
            });
            req.loggedInUser.bookRoom = req.params.id;
            req.loggedInUser.save((err, user) => {
              if (err) {
                return next(err);
              }
              if (user) console.log("user:::::", user);
            });

            sender.sendMail(renterMail, (err, done) => {});
            res.json({ room: room, message: "Room Booked Successfully" });
          }
        });
      }
    });
  })
  .delete(authenticate, (req, res, next) => {
    req.loggedInUser.bookRoom = null;
    req.loggedInUser.save((err, deletedData) => {
      if (err) {
        return next({ message: "Cannot delete booked room" });
      } else {
        roomModel.findById(req.params.id).exec((err, room) => {
          if (err) return next({ message: "cannot find room by provided id" });
          room.booked = false;
          room.bookedUser = null;
          room.save((err, updatedRoom) => {
            if (err) {
              return next({ message: "Can not delete booked room" });
            }
            res.json({
              message: "successfully deleted booked room",
              room: updatedRoom,
            });
          });
        });
      }
    });
  });

module.exports = router;
