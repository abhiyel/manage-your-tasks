const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const bodyParser = require("body-parser");
const auth = require("../middleware/auth");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
router.post("/users", urlencodedParser, async (req, res) => {
  const user = new User({
    name: req.body.dname,
    email: req.body.demail,
    age: req.body.dage,
    password: req.body.dpassword,
  });

  try {
    try {
      await user.save();
      res.render("newaccount", {
        title: "account page",
        country: "India",
        holder: "IN",
        name: user.name,
        email: user.email,
      });
    } catch (e) {
      res.status(400).send(e);
    }
  } catch (e) {
    res.render("404", {
      title: "about",
      country: "USA",
      holder: "IN",
      errorMessage: "page error",
    });
  }
});

router.post("/users/login", urlencodedParser, async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.loginemail,
      req.body.loginpassword
    );
    req.session.token = await user.generateAuthToken();
    if (req.body.rem === "yes") {
      req.session.expireAt = -1;
    } else {
      req.session.expireAt = 15 * 60 * 1000 + Date.now();
    }
    res.redirect("/users/me");
  } catch (e) {
    return res.render("404", {
      holder: "IN",
      errorMessage: "An error occurred while loggin in",
    });
  }
});

router.get("/users/me", auth, async (req, res) => {
  if (!req.user) {
    return res.render("404", {
      holder: "IN",
      errorMessage: "session expired",
    });
  }
  res.render("profile", {
    holder: "IN",
    name: req.user.name,
    email: req.user.email,
  });
});

router.get("/accountsettings", auth, async (req, res) => {
  res.redirect("/users/accountsettings");
});

router.get("/users/accountsettings", auth, async (req, res) => {
  if (!req.user) {
    return res.render("404", {
      holder: "IN",
      errorMessage: "An error occurred",
    });
  }
  res.render("settings", {
    holder: "IN",
    name: req.user.name,
  });
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.render("loggedout", {
      holder: "IN",
      name: req.user.name,
    });
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.render("loggedoutall", {
      holder: "IN",
      name: req.user.name,
    });
  } catch (e) {
    return res.render("404", {
      holder: "IN",
      errorMessage: "An error occurred",
    });
  }
});

router.post("/users/me", urlencodedParser, auth, async (req, res) => {
  const req_body = {
    name: req.body.uname,
    email: req.body.uemail,
    age: req.body.uage,
    password: req.body.upassword,
  };
  const updates = Object.keys(req_body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValid = updates.every((update) => allowedUpdates.includes(update));
  if (!isValid) {
    return res.status(400).send({ error: "Invalid updates" });
  }
  try {
    updates.forEach((update) =>
      req_body[update] === ""
        ? (req.user[update] = req.user[update])
        : (req.user[update] = req_body[update])
    );
    await req.user.save();
    return res.render("profileupdated", {
      holder: "IN",
      name: req.user.name,
    });
  } catch (e) {
    return res.render("404", {
      title: "session over",
      country: "USA",
      holder: "IN",
      errorMessage: "Page Error",
    });
  }
});

router.post("/users/deleteAccount", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.render("accountdeleted", {
      holder: "IN",
      name: req.user.name,
    });
  } catch (e) {
    res.render("404", {
      title: "about",
      country: "USA",
      holder: "IN",
      errorMessage: "page error",
    });
  }
});

module.exports = router;
