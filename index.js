const express = require("express");
const { check, validationResult } = require("express-validator");
const path = require("path");
const fileUpload = require("express-fileupload");
const session = require("express-session");

const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1/Espirit", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Users = mongoose.model("Users", {
  username: String,
  password: String,
  email: String,
  gender: String,
  age: Number,
  description: String,
  referralcode: String,
});

const Professionals = mongoose.model("Professionals", {
  name: String,
  phone: String,
  description: String,
  degree: String,
  specialization: String,
});

const SubMT = mongoos.model("SubMT", {
  name: String,
  phone: String,
  email: String,
});

const SubMP = mongoos.model("SubMP", {
  name: String,
  phone: String,
  email: String,
});

const SubWP = mongoos.model("SubWP", {
  name: String,
  phone: String,
  email: String,
});

const SubYP = mongoos.model("SubYP", {
  name: String,
  phone: String,
  email: String,
});

const Referrals = mongoos.model("Referrals", {
  username: String,
  password: String,
  email: String,
  gender: String,
  age: Number,
  description: String,
  rewards: String,
});

const ContactUs = mongoos.model("ContactUs", {
  name: String,
  phone: String,
  email: String,
  query: String,
});

var myApp = express();
myApp.use(express.urlencoded({ extended: false }));

myApp.set("views", path.join(__dirname, "views"));
myApp.use(express.static(__dirname + "/public"));
myApp.set("view engine", "ejs");

myApp.use(express.urlencoded({ extended: false }));

myApp.use(fileUpload());
myApp.use(
  session({
    secret: "seceretkeyforsystemdevelopmentprojectgroup12",
    resave: false,
    saveUninitialised: true,
  })
);

myApp.use((req, res, next) => {
  const isLoggedIn = req.session.loggedIn || false;
  res.locals.isLoggedIn = isLoggedIn;
  next();
});

myApp.get("/", function (req, res) {
  res.render("home");
});

myApp.get("/login", function (req, res) {
  res.render("login");
});


myApp.get("/logout", function (req, res) {
  req.session.username = "";
  req.session.loggedIn = false;
  res.redirect("/login");
});

myApp.post("/login", function (req, res) {
  let username = req.body.username;
  let password = req.body.password;
  var adminpagedata = {
    username,
    password,
  };
  var myAdmin = new Reporter(adminpagedata);
  myAdmin.save();
  User.find({}).exec(function (err, myUser) {
    var pageData = {
      mytickets: mytickets,
    };
    res.render("dashboard", pageData);
  });
});

myApp.listen(8080);

console.log("Successfully Running on port 8080....");
