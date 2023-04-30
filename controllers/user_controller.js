const User = require("../models/user_model"); //taking model module
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// converting to bcryt data
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    res.status(400).json({ message: "Something Went wrong", status: true });
  }
};

// converting to bcryt data

//creating new user -signup page
const insertUser = async (req, res, next) => {
  try {
    const Data = await User.findOne({ email: req.body.email });
    if (Data) {
      res
        .status(400)
        .send({ message: "E-mail Already Registered", status: false });
    } else {
      const psw = await securePassword(req.body.password);
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: psw,
        image: "1681657015914-profile.png",
      });
      await user.save();

      //jwt token create
      const token = await jwt.sign(
        { user_id: user._id, type: "user" },
        "secret_key",
        {
          expiresIn: "2d",
        }
      );
      user.token = token;
      if (user.token) {
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: 48 * 60 * 60 * 1000,
        });
        // return success
        res.status(200).json({ token: user.token, status: true });
      } else {
        res.status(400).send({
          message: "Registeration failed try again please!",
          status: false,
        });
      }
    }
  } catch (error) {
    res.status(400).json({ message: "Something Went wrong", status: true });
  }
};

const verifyLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordCheck = await bcrypt.compare(password, userData.password); //comparing database bycrpt with user typed password
      if (passwordCheck) {
        const token = await jwt.sign(
          { user_id: userData._id, type: "user" },
          process.env.SECRET_KEY,
          {
            expiresIn: "2d",
          }
        );
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: 48 * 60 * 60 * 1000,
        });
        userData.token = token;
        res.status(200).json({ token: userData.token, status: true });
      } else {
        res.status(400).send({ message: "Password is incorrect!" });
      }
    } else {
      res.status(400).send({
        message: "E-mail is not registered!,Please signup to continue..",
      });
    }
  } catch (error) {
    res.status(400).json({ message: "Something Went wrong", status: true });
  }
};

const getUser = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(400).json({ message: "Token not provided" });
    }
    const token = authHeader.slice(6);
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.user_id;
    const userData = await User.findById(userId);
    if (userData) {
      res.status(200).json({ userData: userData, status: true });
    } else {
      res.status(400).json({ message: "There is no user", status: false });
    }
  } catch (error) {
    res.status(400).json({ message: "Something Went wrong", status: true });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).send({ message: "success" });
  } catch (error) {
    res.status(400).json({ message: "Something Went wrong", status: true });
  }
};

const profileUpdate = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (id) {
      const data = await User.findById({ _id: id });
      const imagePath = path.join(__dirname, "../public/images", data.image);
      fs.unlinkSync(imagePath);
      await User.findByIdAndUpdate(
        { _id: id },
        { $set: { image: req.file.filename } },
        { new: true }
      ).then((data) => {
        res.status(200).json({
          userData: data,
          message: "Updated",
          status: true,
        });
      });
    } else {
      res.status(400).json({ message: "Something Went wrong", status: true });
    }
  } catch (error) {
    res.status(400).json({ message: "Something Went wrong", status: true });
  }
};

//exporting this module
module.exports = {
  insertUser,
  verifyLogin,
  getUser,
  logout,
  profileUpdate,
};
