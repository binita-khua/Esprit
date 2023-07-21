const express = require("express");
const { check, validationResult } = require("express-validator");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt"); // Import bcrypt library

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
});

const Professionals = mongoose.model("Professionals", {
  name: String,
  phone: String,
  description: String,
  degree: String,
  specialization: String,
});

const SubMT = mongoose.model("SubMT", {
  name: String,
  phone: String,
  email: String,
});

const SubMP = mongoose.model("SubMP", {
  name: String,
  phone: String,
  email: String,
});

const SubWP = mongoose.model("SubWP", {
  name: String,
  phone: String,
  email: String,
});

const SubYP = mongoose.model("SubYP", {
  name: String,
  phone: String,
  email: String,
});

const ContactUs = mongoose.model("ContactUs", {
  name: String,
  phone: String,
  email: String,
  query: String,
});

const myApp = express();
myApp.use(express.urlencoded({ extended: false }));

myApp.set("views", path.join(__dirname, "views"));
myApp.set("view engine", "ejs");

myApp.use(express.static(__dirname + "/public"));

// Session middleware setup
myApp.use(session({
  secret: "your_secret_key_here", // Replace with a strong secret key for session encryption
  resave: false,
  saveUninitialized: true,
}));

// Middleware to check if the user is logged in and set the 'isLoggedIn' variable in views
myApp.use((req, res, next) => {
  const isLoggedIn = req.session.loggedIn || false;
  res.locals.isLoggedIn = isLoggedIn;
  next();
});

// Validation rules for Users model
const validateUsers = [
  check("username").notEmpty().withMessage("Username is required."),
  check("password").notEmpty().withMessage("Password is required."),
  check("email").notEmpty().withMessage("Email is required.").isEmail().withMessage("Invalid email format."),
  check("gender").notEmpty().withMessage("Gender is required."),
  check("age").notEmpty().withMessage("Age is required.").isInt().withMessage("Age must be a number."),
];

// Validation rules for Professionals model
const validateProfessionals = [
  check("name").notEmpty().withMessage("Name is required."),
  check("phone").notEmpty().withMessage("Phone is required.").matches(/^\d{3}-\d{3}-\d{4}$/).withMessage("Invalid phone number format. Use 333-333-3333."),
  check("description").notEmpty().withMessage("Description is required."),
  check("degree").notEmpty().withMessage("Degree is required."),
  check("specialization").notEmpty().withMessage("Specialization is required."),
];

// Validation rules for SubMT model
const validateSubMT = [
  check("name").notEmpty().withMessage("Name is required."),
  check("phone").notEmpty().withMessage("Phone is required.").matches(/^\d{3}-\d{3}-\d{4}$/).withMessage("Invalid phone number format. Use 333-333-3333."),
  check("email").notEmpty().withMessage("Email is required.").isEmail().withMessage("Invalid email format."),
];

// Validation rules for SubMP model
const validateSubMP = [
  check("name").notEmpty().withMessage("Name is required."),
  check("phone").notEmpty().withMessage("Phone is required.").matches(/^\d{3}-\d{3}-\d{4}$/).withMessage("Invalid phone number format. Use 333-333-3333."),
  check("email").notEmpty().withMessage("Email is required.").isEmail().withMessage("Invalid email format."),
];

// Validation rules for SubWP model
const validateSubWP = [
  check("name").notEmpty().withMessage("Name is required."),
  check("phone").notEmpty().withMessage("Phone is required.").matches(/^\d{3}-\d{3}-\d{4}$/).withMessage("Invalid phone number format. Use 333-333-3333."),
  check("email").notEmpty().withMessage("Email is required.").isEmail().withMessage("Invalid email format."),
];

// Validation rules for SubYP model
const validateSubYP = [
  check("name").notEmpty().withMessage("Name is required."),
  check("phone").notEmpty().withMessage("Phone is required.").matches(/^\d{3}-\d{3}-\d{4}$/).withMessage("Invalid phone number format. Use 333-333-3333."),
  check("email").notEmpty().withMessage("Email is required.").isEmail().withMessage("Invalid email format."),
];

// Validation rules for ContactUs model
const validateContactUs = [
  check("name").notEmpty().withMessage("Name is required."),
  check("phone").notEmpty().withMessage("Phone is required.").matches(/^\d{3}-\d{3}-\d{4}$/).withMessage("Invalid phone number format. Use 333-333-3333."),
  check("email").notEmpty().withMessage("Email is required.").isEmail().withMessage("Invalid email format."),
  check("query").notEmpty().withMessage("Query is required."),
];

myApp.get("/", function (req, res) {
  res.render("home");
});

myApp.get("/signup", function (req, res) {
  res.render("signup");
});

myApp.post("/signup", validateUsers, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("signup", { errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    // Generate a salt and hash the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new User document with the hashed password and save it to the database
    const newUser = new Users({
      username: username,
      password: hashedPassword,
      email: req.body.email,
      gender: req.body.gender,
      age: req.body.age,
    });

    await newUser.save();

    return res.status(201).redirect("/login");
  } catch (err) {
    return res.status(500).render("signup", { error: "Error creating user." });
  }
});

myApp.get("/login", function (req, res) {
  res.render("login");
});

myApp.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    // Find the user in the database based on the provided username
    const user = await Users.findOne({ username: username });

    if (!user) {
      return res.status(401).render("login", { error: "Invalid username or password." });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).render("login", { error: "Invalid username or password." });
    }

    // Password is correct, set session variables to indicate that the user is logged in
    req.session.username = username;
    req.session.loggedIn = true;

    res.redirect("/dashboard");
  } catch (err) {
    return res.status(500).render("login", { error: "Error during login." });
  }
});

myApp.get("/dashboard", function (req, res) {
  // Check if the user is logged in
  if (req.session.loggedIn) {
    // Render the dashboard page
    res.render("dashboard");
  } else {
    // Redirect to login page if not logged in
    res.redirect("/login");
  }
});

myApp.get("/logout", function (req, res) {
  // Clear the session variables to log out the user
  req.session.username = "";
  req.session.loggedIn = false;
  res.redirect("/login");
});

myApp.get("/professional/signup", function (req, res) {
  res.render("professionalsignup");
});

myApp.post("/professional/signup", validateProfessionals, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("professionalsignup", { errors: errors.array() });
  }

  const newProfessional = new Professionals({
    name: req.body.name,
    phone: req.body.phone,
    description: req.body.description,
    degree: req.body.degree,
    specialization: req.body.specialization,
  });

  await newProfessional.save();

  return res.status(201).redirect("/professional/dashboard");
});

// Route for professional login page
myApp.get("/professional/login", function (req, res) {
  res.render("professionallogin");
});

// Route for handling professional login form submission
myApp.post("/professional/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    // Find the professional in the database based on the provided username
    const professional = await Professionals.findOne({ name: username });

    if (!professional) {
      return res.status(401).render("professionallogin", { error: "Invalid username or password." });
    }

    // Compare the provided password with the stored password
    const passwordMatch = await bcrypt.compare(password, professional.password);

    if (!passwordMatch) {
      return res.status(401).render("professionallogin", { error: "Invalid username or password." });
    }

    // Password is correct, set session variables to indicate that the professional is logged in
    req.session.username = username;
    req.session.loggedIn = true;

    res.redirect("/professional/dashboard");
  } catch (err) {
    return res.status(500).render("professionallogin", { error: "Error during login." });
  }
});

// Route for professional logout
myApp.get("/professional/logout", function (req, res) {
  // Clear the session variables to log out the professional
  req.session.username = "";
  req.session.loggedIn = false;
  res.redirect("/professional/login");
});

// Route for SubMT signup page
myApp.get("/submt/signup", function (req, res) {
  res.render("submtsignup");
});

myApp.post("/submt/signup", validateSubMT, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("submtsignup", { errors: errors.array() });
  }

  const newSubMT = new SubMT({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
  });

  await newSubMT.save();

  return res.status(201).redirect("/submt/dashboard");
});

// Route for SubMP signup page
myApp.get("/submp/signup", function (req, res) {
  res.render("submpsignup");
});

myApp.post("/submp/signup", validateSubMP, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("submpsignup", { errors: errors.array() });
  }

  const newSubMP = new SubMP({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
  });

  await newSubMP.save();

  return res.status(201).redirect("/submp/dashboard");
});

// Route for SubWP signup page
myApp.get("/subwp/signup", function (req, res) {
  res.render("subwpsignup");
});

myApp.post("/subwp/signup", validateSubWP, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("subwpsignup", { errors: errors.array() });
  }

  const newSubWP = new SubWP({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
  });

  await newSubWP.save();

  return res.status(201).redirect("/subwp/dashboard");
});

// Route for SubYP signup page
myApp.get("/subyp/signup", function (req, res) {
  res.render("subypsignup");
});

myApp.post("/subyp/signup", validateSubYP, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("subypsignup", { errors: errors.array() });
  }

  const newSubYP = new SubYP({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
  });

  await newSubYP.save();

  return res.status(201).redirect("/subyp/dashboard");
});

myApp.get("/contactus", function (req, res) {
  res.render("contactus");
});

myApp.post("/contactus", validateContactUs, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("contactus", { errors: errors.array() });
  }

  const newContactUs = new ContactUs({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    query: req.body.query,
  });

  await newContactUs.save();

  return res.status(201).redirect("/");
});

// Start the server
const port = 8080;
myApp.listen(port, () => {
  console.log(`Successfully running on port ${port}....`);
});
