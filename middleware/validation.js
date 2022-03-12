const userModel = require("./../models/user.model");

module.exports = (req, res, next) => {
  /* confirm password and password match */
  // if (req.body.password !== req.body.confirmPassword) {
  //     return next({ message: 'your password does not match' })
  // }
  /* number validation */
  if (req.body.phoneNumber) {
    var numb = /^\(?9\)?(\d{9})$/;
    var isValidate = numb.test(req.body.phoneNumber);
    if (!isValidate) {
      return next({ message: "Check Your Mobile Number Again" });
    }
  }

  /* email validation */
  if (req.body.Email) {
    var Email =
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    var isValidate = Email.test(req.body.Email);
    if (!isValidate) return next({ message: "Wrong Email Address, Try Again" });
  }

  /* username checked */
  // if (req.body.username) {
  //     userModel.findOne({
  //         username: req.body.username
  //     }).exec((err, done) => {
  //         if (err) {
  //             return next(err)
  //         } else {
  //             if (done)
  //                 return next({ message: 'Username is already used' })
  //         }
  //     })
  // }

  /* email checked */
  if (req.body.Email) {
    userModel
      .findOne({
        Email: req.body.Email,
      })
      .exec((err, done) => {
        if (err) {
          return next(err);
        } else {
          if (done) return next({ message: "Email address is already used" });
        }
      });
  }
  /* phone checked */
  if (req.body.phoneNumber) {
    userModel
      .findOne({
        phoneNumber: req.body.phoneNumber,
      })
      .exec((err, done) => {
        if (err) {
          return next(err);
        } else {
          if (done) return next({ message: "Mobile Number is already used" });
        }
      });
  }
  next();
};
