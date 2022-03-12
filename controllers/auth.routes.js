const router = require("express").Router();
const express = require("express")();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("./../config/index");

const userModel = require("./../models/user.model");
const userExtraModel = require("./../models/user.extra.model");

const userHelp = require("./../helper/user.help");
const sender = require("./../config/nodemailer.config");
const validation = require("./../middleware/validation");

const verifyRoutes = require("./auth.verify.routes");

express.use("/verify", verifyRoutes);

function prepareEmail(details) {
  return {
    from: "Room Finder<noreply@abcd.com>",
    to: details.email,
    subject: "Forgot Password✔",
    text: "Forgot Password✔",
    html: `<p>Hi <strong>${details.name}</strong><p>
        <p>We noticed that you are having trouble logging into our system, please use the link below to reset the password.</p>
        <p><a href="${details.link}" target="_blank">Reset Password</a></p>
        <p>If you have not requested to reset your password, kindly ignore this message</p>`,
  };
}

function verifyEmail(details) {
  return {
    from: "Room Finder<noreply@abcd.com>",
    to: details.email,
    subject: "Verify Email✔",
    text: "Verify Email✔",
    html: `<p>Hi, <strong>${details.name}</strong></p>
        <p>Verify your email to become our trusted member. Use link below to verify your email address</p>
        <p><a href="${details.verifyLink}" target="_blank">Verify Email</a></p>
        <p>If you did not suscribe our website, use the link below to unscribe it.</p>
        <p><a href="${details.deleteLink}" target="_blank">Unsuscribe</a></p>`,
  };
}
const assignToken = (id) => {
  return jwt.sign({ id: id }, config.jwtSecretKey);
};

router.post("/register", validation, (req, res, next) => {
  console.log("reqqqqqqqqq", req.body);
  var user = new userModel();
  user = userHelp(req.body, user);
  /* https://medium.com/@tariqul.islam.rony/sending-email-through-express-js-using-node-and-nodemailer-with-custom-functionality-a999bb7cd13c */
  user.save((err, user) => {
    if (err) {
      return next(err);
    }
    var token = assignToken(user._id);
    var userExtra = new userExtraModel();
    userExtra._id = user._id;
    userExtra.save((err, done) => {
      if (err) {
        return next(err);
      }
    });
    res.json({ token: token, user: user });
  });
});

/* router .post(verify) */

/* router.post('/verify/email',(req,res,next)=>{
    if('email' in req.body){
        let {email} = req.body
        if(email.test()){

            var val = Math.floor(1000 + Math.random() * 9000);
            console.log(val);
            //email valid

            let message = "Your validation toke is "+ val;
            let subject = "Email Valdiation from ...";




        }else{
            res.status(400).json({message:"Please porvide valid mail",success:false})
        }
    }else{
        res.status(400).json({message:"Email is not provide",success:false})
    }
})

//emailed code verfiy
router.post('/') */

router.post("/login", (req, res, next) => {
  console.log("req------", req.body);
  userModel.findOne({ Email: req.body.Email }).exec((err, user) => {
    if (err) {
      return next(err);
    }

    if (user) {
      console.log("user>>", user);
      var isMatched = bcrypt.compareSync(req.body.password, user.password);
      if (isMatched) {
        var token = assignToken(user._id);
        /* var val = Math.floor(1000 + Math.random() * 9000);
console.log(val); */
        res.json({
          token: token,
          user: user,
        });
      } else {
        return next({
          message: "Password did not match",
        });
      }
    } else {
      return next({
        message: "Username did not matched",
      });
    }
  });
});

router.post("/forgotPassword", (req, res, next) => {
  userModel
    .findOne({
      email: req.body.email,
    })
    .exec((err, user) => {
      if (err) {
        return next(err);
      }
      if (user) {
        var resetLink = req.headers.origin + "/auth/reset-password/" + user._id;
        var mailBody = prepareEmail({
          name: user.name,
          email: user.email,
          link: resetLink,
        });
        userExtraModel.findById(user._id).exec((err, extra) => {
          if (err) {
            return next(err);
          }
          if (extra) {
            extra.passwordResetExpiry =
              new Date().getTime() + 1000 * 60 * 60 * 24 * 1;
          }
          extra.save((err, saved) => {
            if (err) {
              return next(err);
            }
            console.log("saved", saved);
          });
          sender.sendMail(mailBody, (err, done) => {
            if (err) {
              return next(err);
            } else {
              res.json(done);
            }
          });
        });
      } else {
        return next({
          message: "User not registered with provided email",
        });
      }
    });
});

router.post("/resetPassword/:id", validation, (req, res, next) => {
  userModel.findById(req.params.id).exec((err, user) => {
    if (err) {
      return next(err);
    }
    userExtraModel.findById(req.params.id).exec((err, extra) => {
      if (err) {
        return next(err);
      }
      if (user) {
        var resetTime = new Date(extra.passwordResetExpiry).getTime();
        var now = Date.now();
        if (resetTime > now) {
          user.password = bcrypt.hashSync(req.body.password, config.saltRounds);
          extra.passwordResetExpiry = null;
          user.save((err, done) => {
            if (err) {
              return next(err);
            }
            extra.save((err, done) => {
              if (err) {
                return next(err);
              }
            });
            res.json(done);
          });
        } else {
          return next({
            message: "Password reset link expired.",
          });
        }
      } else {
        return next({
          message: "User not found",
        });
      }
    });
  });
});
/* send email */
router.get("/email/:email", (req, res, next) => {
  userModel
    .findOne({
      email: req.params.email,
    })
    .exec((err, done) => {
      if (err) {
        return next(err);
      }
      if (done) {
        var verifyLink =
          req.headers.origin +
          "/auth/verify/email/" +
          done._id +
          "?verify=true";
        var deleteLink =
          req.headers.origin +
          "/auth/verify/email/" +
          done._id +
          "?verify=false";
        var mailBody = verifyEmail({
          name: done.name,
          email: done.email,
          verifyLink: verifyLink,
          deleteLink: deleteLink,
        });
        sender.sendMail(mailBody, (err, done) => {
          if (err) {
            return next(err);
          }
          res.json(done);
        });
      }
    });
});

/* Verify Email */
router.get("/verify/email/:id", (req, res, next) => {
  userModel.findById(req.params.id).exec((err, user) => {
    if (err) {
      return next(err);
    }
    if (user) {
      var verify = req.query.verify;
      console.log("this.verify>>>>", req.query);
      if (verify) {
        userExtraModel
          .findOne({
            user: user.user,
          })
          .exec((err, extra) => {
            if (err) {
              return next(err);
            }
            if (extra.emailVerify == true) {
              return next({
                message: "Already Verified",
              });
            }
            extra.emailVerify = true;
            console.log("extra>>>", extra);
            extra.save((err, done) => {
              if (err) {
                return next(err);
              }
              if (done) {
                res.json(done);
              }
            });
          });
      }
    }
  });
  router.delete("/:id", (req, res, next) => {
    userModel.findByIdAndDelete(req.params.id).exec((err, removed) => {
      if (err) {
        console.log("err");
        return next(err);
      }
      console.log("removeddd.....", removed);
      res.json(removed);
    });
  });
});
module.exports = router;
