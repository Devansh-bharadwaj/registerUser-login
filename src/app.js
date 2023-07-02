require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
require("./db/conn");
const path = require("path");
const hbs = require("hbs");
const Register = require("./models/registers");
const Employee = require("./models/registers");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let static_path = path.join(__dirname, "../public");
const templatePath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templatePath);
hbs.registerPartials(partialsPath);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  // Where "/scripts/js" is a folder into "public"
  "/scripts/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      age,
      phone,
      gender,
      password,
      confirmpassword,
      email,
    } = req.body;
    if (password === confirmpassword) {
      const registerEmployee = new Register({
        firstname,
        lastname,
        age,
        phone,
        gender,
        password,
        confirmpassword,
        email,
      });

      const token = await registerEmployee.generateAuthToken();

      const registered = await registerEmployee.save();
      console.log(registered);
      res.status(201).render("index");
    } else {
      res.send("password is not matching");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    // console.log(`email and password is ${email} and ${password}`);

    const userEmail = await Register.findOne({ email: email });
    const isMatch = bcrypt.compare(password, userEmail.password);
    const token = await userEmail.generateAuthToken();
    console.log("The token part is: " + token);
    if (isMatch) {
      res.render("index");
    } else {
      res.send("Invalid password");
    }
  } catch (error) {
    res.send(error);
  }
});

// const createToken = async () => {
//   const token = await jwt.sign(
//     { _id: "64981a63a03e63d3ad74f9c5" },
//     "mynameisdevanshbharadwajwebdeveloper"
//   );
//   console.log(token);

//   const userVerification = await jwt.verify(
//     token,
//     "mynameisdevanshbharadwajwebdeveloper"
//   );
//   console.log(userVerification);
// };

// createToken();

app.listen(port, () => {
  console.log(`App is running on port no. ${port}`);
});
