const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

const employeeSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    minlength: 2,
  },
  lastname: {
    type: String,
    required: true,
    minlength: 2,
  },
  email: {
    type: String,
    unique: [true, "This email is already exist"],
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid email id.");
      }
    },
  },
  gender: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  phone: {
    type: Number,
    unique: true,
    required: true,
    min: 10,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// creating auth token
employeeSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ id: this._id.toString() }, secretKey);
    console.log("The token part is:" + token);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// generating hash password
employeeSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    console.log(`current password: ${this.password}`);
    this.password = await bcrypt.hash(this.password, 10);
    this.confirmpassword = await bcrypt.hash(this.confirmpassword, 10);
    console.log(`secured password: ${this.password}`);

    // this.confirmpassword = undefined;
  }
  next();
});

const Employee = new mongoose.model("Employee", employeeSchema);

module.exports = Employee;
