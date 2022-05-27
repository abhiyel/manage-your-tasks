const jwt = require("jsonwebtoken");
const User = require("../models/user");
const auth = async (req, res, next) => {
  try {
    const token = req.session.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error();
    }
    if (req.session.expireAt == -1) {
      req.token = token;
      req.user = user;
    } else if (Date.now() > req.session.expireAt) {
      throw new Error();
    } else {
      req.token = token;
      req.user = user;
    }
  } catch (e) {
    req.user = null;
    req.token = null;
  }
  next();
};

module.exports = auth;
