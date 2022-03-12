const bcrypt = require("bcrypt");
const config = require("./../config/index");

module.exports = (req, user) => {
  if (req.firstName) user.firstName = req.firstName;
  if (req.lastName) user.lastName = req.lastName;
  if (req.oldPassword) {
    var isMatched = bcrypt.compareSync(req.oldPassword, user.password);
  } else {
    var isMatched = true;
  }
  if (req.password && isMatched) {
    user.password = bcrypt.hashSync(req.password, config.saltRounds);
  }
  if (req.address) user.address = req.address;
  if (req.Email) user.Email = req.Email;
  if (req.phoneNumber) user.phoneNumber = req.phoneNumber;
  if (req.gender) user.gender = req.gender;
  if (req.role) user.role = req.role;
  return user;
};
