const express = require("express");
const { check, validationResult } = require("express-validator");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt"); 
const axios = require('axios');
const mongoose = require("mongoose");

const clientId = 'e1211f97-83b5-44a1-8d6f-983b594e2ce7';
const clientSecret = 'ddf4006d-4c0d-4fe5-87aa-22388a42f3ab';
const tenantId = 'f8cdef31-a31e-4b4a-93e4-5f571e91255a';
const scope = 'https://graph.microsoft.com/.default';

const getToken = async () => {
  try {
    const response = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: clientId,
        scope,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      })
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting token:', error.message);
  }
};

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
  selectedProfessional: mongoose.Schema.Types.ObjectId,
});

const Professionals = mongoose.model("Professionals", {
  username: String,
  password: String,
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
myApp.use(
  session({
    secret: "your_secret_key_here", // Replace with a strong secret key for session encryption
    resave: false,
    saveUninitialized: true,
  })
);

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
  check("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format."),
  check("gender").notEmpty().withMessage("Gender is required."),
  check("age")
    .notEmpty()
    .withMessage("Age is required.")
    .isInt()
    .withMessage("Age must be a number."),
];

// Validation rules for Professionals model
const validateProfessionals = [
  check("name").notEmpty().withMessage("Name is required."),
  check("phone")
    .notEmpty()
    .withMessage("Phone is required.")
    .matches(/^\d{3}-\d{3}-\d{4}$/)
    .withMessage("Invalid phone number format. Use 333-333-3333."),
  check("description").notEmpty().withMessage("Description is required."),
  check("degree").notEmpty().withMessage("Degree is required."),
  check("specialization").notEmpty().withMessage("Specialization is required."),
];

// Validation rules for SubMT model
const validateSubMT = [
  check("name").notEmpty().withMessage("Name is required."),
  check("phone")
    .notEmpty()
    .withMessage("Phone is required.")
    .matches(/^\d{3}-\d{3}-\d{4}$/)
    .withMessage("Invalid phone number format. Use 333-333-3333."),
  check("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format."),
];

// Validation rules for SubMP model
const validateSubMP = [
  check("name").notEmpty().withMessage("Name is required."),
  check("phone")
    .notEmpty()
    .withMessage("Phone is required.")
    .matches(/^\d{3}-\d{3}-\d{4}$/)
    .withMessage("Invalid phone number format. Use 333-333-3333."),
  check("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format."),
];

// Validation rules for SubWP model
const validateSubWP = [
  check("name").notEmpty().withMessage("Name is required."),
  check("phone")
    .notEmpty()
    .withMessage("Phone is required.")
    .matches(/^\d{3}-\d{3}-\d{4}$/)
    .withMessage("Invalid phone number format. Use 333-333-3333."),
  check("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format."),
];

// Validation rules for SubYP model
const validateSubYP = [
  check("name").notEmpty().withMessage("Name is required."),
  check("phone")
    .notEmpty()
    .withMessage("Phone is required.")
    .matches(/^\d{3}-\d{3}-\d{4}$/)
    .withMessage("Invalid phone number format. Use 333-333-3333."),
  check("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format."),
];

// Validation rules for ContactUs model
const validateContactUs = [
  check("name").notEmpty().withMessage("Name is required."),
  check("phone")
    .notEmpty()
    .withMessage("Phone is required.")
    .matches(/^\d{3}-\d{3}-\d{4}$/)
    .withMessage("Invalid phone number format. Use 333-333-3333."),
  check("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format."),
  check("query").notEmpty().withMessage("Query is required."),
];

myApp.get("/", function (req, res) {
  res.render("home");
});

myApp.get("/signup", function (req, res) {
  res.render("signup", { errors: [] });
});

myApp.post("/signup", validateUsers, async (req, res) => {
  // Validate the user input using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If there are validation errors, render the signup form with the errors
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
  res.render("login", { errors: [] });
});

myApp.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    // Find the user in the database based on the provided username
    const user = await Users.findOne({ username: username });

    if (!user) {
      return res
        .status(401)
        .render("login", { error: "Invalid username or password." });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .render("login", { error: "Invalid username or password." });
    }

    // Password is correct, set session variables to indicate that the user is logged in
    req.session.username = username;
    req.session.loggedIn = true;

    res.redirect("/dashboard");
  } catch (err) {
    return res.status(500).render("login", { error: "Error during login." });
  }
});

myApp.get("/dashboard", async (req, res) => {
  try {
    // Check if the user is logged in
    if (req.session.loggedIn) {
      // Fetch professionals' data from the database (replace with your own logic)
      const professionals = await Professionals.find();

      // Find the user in the database based on their username
      const user = await Users.findOne({ username: req.session.username });

      // Check if the user has a selected professional
      if (user.selectedProfessional) {
        // Redirect to the selected-professional page
        return res.redirect("/schedule-session/" + user.selectedProfessional);
      }

      // Render the dashboard page and pass the professionals array to the template
      res.render("dashboard", { loggedIn: true, professionals: professionals });
    } else {
      // Redirect to login page if not logged in
      res.redirect("/login");
    }
  } catch (err) {
    console.error("Error fetching professionals:", err);
    // Handle the error by rendering a simple error message directly
    res.status(500).send("An error occurred while fetching professionals.");
  }
});



myApp.post("/select-professional", async (req, res) => {
  try {
    // Check if the user is logged in
    if (req.session.loggedIn) {
      const selectedProfessionalId = req.body.professionalId;

      // Find the user in the database based on their username
      console.log("Session username:", req.session.username);
      const user = await Users.findOne({ username: req.session.username });
      console.log("Found user:", user);

      if (!user) {
        console.error("User not found in the database:", req.session.username);
        return res.status(401).render("login", { error: "User not found." });
      }

      user.selectedProfessional = selectedProfessionalId;

      // Save the updated user document
      await user.save();

      // Redirect to the scheduling page with the selected professional's ID
      return res.redirect("/schedule-session/" + selectedProfessionalId);
    } else {
      // Redirect to login page if not logged in
      res.redirect("/login");
    }
  } catch (err) {
    console.error("Error selecting professional:", err);
    res
      .status(500)
      .render("error", {
        error: "An error occurred while selecting the professional.",
      });
  }
});

myApp.get("/schedule-session/:professionalId", async (req, res) => {
  try {
    // Check if the user is logged in
    if (req.session.loggedIn) {
      // Fetch the selected professional's information from the database
      const selectedProfessional = await Professionals.findById(
        req.params.professionalId
      );


      if (!selectedProfessional) {
        return res.status(404).render("dashboard", {
          loggedIn: true,
          professional: null,
          error: "Selected professional not found.",
        });
      }

      // Render the schedule-session template and pass the selected professional's information
      res.render("schedule-session", {
        loggedIn: true,
        professional: selectedProfessional,
      });
    } else {
      // Redirect to login page if not logged in
      res.redirect("/login");
    }
  } catch (err) {
    console.error("Error loading schedule session page:", err);
    res.status(500).render("schedule-session", {
      loggedIn: true,
      professional: null,
      error: "An error occurred while loading the schedule session page.",
    });
  }
});

myApp.post("/schedule-session", async (req, res) => {
  try {
    const accessToken = await getToken(); // Call your getToken function to get the access token

    const { startDate, endDate, subject } = req.body; // Get user input from the request body

    const eventRequestBody = {
      subject: subject,
      start: {
        dateTime: new Date(startDate).toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(endDate).toISOString(),
        timeZone: "UTC",
      },
    };

    // Make the API request to create an event in the user's Outlook calendar
    const response = await axios.post(
      "https://graph.microsoft.com/v1.0/me/events",
      eventRequestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      // Event created successfully
      const eventData = response.data;
      // You can send a success response back to the client if needed
      res.status(200).json({ message: "Event created successfully", data: eventData });
    } else {
      // Handle the case where the response status is not 200
      console.error("Failed to create event. Response:", response.data);
      res.status(response.status).json({ error: "Failed to create event" });
    }
  } catch (error) {
    // Handle network or other errors
    console.error("Error creating event:", error);
    res.status(500).json({ error: "An error occurred while creating event" });
  }
});



// Add this route handler to your existing code
myApp.post("/remove-professional", async (req, res) => {
  try {
    // Check if the user is logged in
    if (req.session.loggedIn) {
      // Find the user in the database based on their username
      const user = await Users.findOne({ username: req.session.username });

      if (user) {
        // Remove the selectedProfessional reference
        user.selectedProfessional = null;
        await user.save();
        return res.status(200).send("Professional removed successfully.");
      } else {
        return res.status(401).send("User not found.");
      }
    } else {
      // Redirect to login page if not logged in
      res.redirect("/login");
    }
  } catch (err) {
    console.error("Error removing professional:", err);
    res.status(500).send("An error occurred while removing the professional.");
  }
});

myApp.get("/sessionconfirm", function (req, res) {
  res.render("sessionconfirm", { errors: [] });
});


myApp.get("/logout", function (req, res) {
  // Clear the session variables to log out the user
  req.session.username = "";
  req.session.loggedIn = false;
  res.redirect("/login");
});

myApp.get("/professionalsignup", function (req, res) {
  res.render("professionalsignup", { errors: [] });
});

// Professional Signup Form Submission
myApp.post("/professionalsignup", validateProfessionals, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .render("professionalsignup", { errors: errors.array() });
  }

  const {
    username,
    password,
    name,
    phone,
    description,
    degree,
    specialization,
  } = req.body;

  try {
    // Generate a salt and hash the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new Professional document with the hashed password and save it to the database
    const newProfessional = new Professionals({
      username: username,
      password: hashedPassword,
      name: name,
      phone: phone,
      description: description,
      degree: degree,
      specialization: specialization,
    });

    await newProfessional.save();

    return res.status(201).redirect("/professionallogin");
  } catch (err) {
    return res
      .status(500)
      .render("professionalsignup", { error: "Error creating professional." });
  }
});

// Route for professional login page
myApp.get("/professionallogin", function (req, res) {
  res.render("professionallogin", { error: null });
});

// Route for handling professional login form submission
myApp.post("/professionallogin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    // Find the professional in the database based on the provided username
    const professional = await Professionals.findOne({ username: username });

    if (!professional) {
      return res
        .status(401)
        .render("professionallogin", {
          error: "Invalid username or password.",
        });
    }

    // Compare the provided password with the stored password
    const passwordMatch = await bcrypt.compare(password, professional.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .render("professionallogin", {
          error: "Invalid username or password.",
        });
    }

    // Password is correct, set session variables to indicate that the professional is logged in
    req.session.username = professional.username; // Use the username from the database
    req.session.loggedIn = true;

    res.redirect("/professionaldashboard");
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(401)
      .render("professionallogin", {
        error: "An error occurred during login.",
      });
  }
});

myApp.get("/professionaldashboard", async (req, res) => {
  try {
    // Check if the professional is logged in
    if (req.session.loggedIn) {
      // Find the professional in the database based on their username
      const professional = await Professionals.findOne({
        username: req.session.username,
      });

      if (!professional) {
        return res
          .status(401)
          .render("professionallogin", { error: "Professional not found." });
      }

      // Find users assigned to the professional based on their ID
      const assignedUsers = await Users.find({
        selectedProfessional: professional._id,
      });

      // Render the professionaldashboard template and pass the professional and assigned users' information
      res.render("professionaldashboard", {
        loggedIn: true,
        professional: professional,
        assignedUsers: assignedUsers,
      });
    } else {
      // Redirect to professional login page if not logged in
      res.redirect("/professionallogin");
    }
  } catch (err) {
    console.error("Error loading professional dashboard:", err);
    res
      .status(500)
      .render("error", {
        error: "An error occurred while loading the professional dashboard.",
      });
  }
});

myApp.get("/schedule-session/:userId", async (req, res) => {
  try {
    // Check if the professional is logged in
    if (req.session.loggedIn) {
      // Find the user based on the provided userId
      const user = await Users.findById(req.params.userId);

      if (!user) {
        return res.status(404).send("User not found.");
      }

      // Perform any necessary logic to schedule the session, e.g., integrate with Microsoft Teams API

      // Fetch assigned users again (this could be done in a more efficient way)
      const assignedUsers = await Users.find({
        selectedProfessional: professional._id,
      });

      // Render the "professionaldashboard" template with the success message and updated assigned users
      return res.status(200).render("professionaldashboard", {
        loggedIn: true,
        professional: professional,
        assignedUsers: assignedUsers,
        message: "Session scheduled successfully.",
      });
    } else {
      // Redirect to professional login page if not logged in
      res.redirect("/professionallogin");
    }
  } catch (err) {
    console.error("Error scheduling session:", err);
    return res
      .status(500)
      .send("An error occurred while scheduling the session.");
  }
});

// Route for professional logout
myApp.get("/professionallogout", function (req, res) {
  // Clear the session variables to log out the professional
  req.session.username = "";
  req.session.loggedIn = false;
  res.redirect("/professionallogin");
});


// Route for SubMT signup page
myApp.get("/submtsignup", function (req, res) {
  res.render("submtsignup", { errors: [] });
});

myApp.post("/submtsignup", validateSubMT, async (req, res) => {
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

  return res.status(201).redirect("/submtdashboard");
});

// Route for SubMP signup page
myApp.get("/submpsignup", function (req, res) {
  res.render("submpsignup", { errors: [] });
});

myApp.post("/submpsignup", validateSubMP, async (req, res) => {
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

  return res.status(201).redirect("/submpdashboard");
});

// Route for SubWP signup page
myApp.get("/subwpsignup", function (req, res) {
  res.render("subwpsignup", { errors: [] });
});

myApp.post("/subwpsignup", validateSubWP, async (req, res) => {
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

  return res.status(201).redirect("/subwpdashboard");
});

// Route for SubYP signup page
myApp.get("/subypsignup", function (req, res) {
  res.render("subypsignup", { errors: [] });
});

myApp.post("/subypsignup", validateSubYP, async (req, res) => {
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

  return res.status(201).redirect("/subypdashboard");
});

myApp.get("/contactus", function (req, res) {
  res.render("contactus", { errors: [] });
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
