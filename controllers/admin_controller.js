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

const verifyLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });

    if (userData) {
      if (userData.is_admin) {
        const passwordCheck = await bcrypt.compare(password, userData.password); //comparing database bycrpt with user typed password
        if (passwordCheck) {
          const token = await jwt.sign(
            { user_id: userData._id, type: "admin" },
            "secret_key",
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
        res.status(400).send({ message: "You Are Not Admin!" });
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

const getUsers = async (req, res) => {
  try {
    const data = await User.find({ is_admin: 0 });
    res.status(200).send({ userData: data });
  } catch (error) {
    res.status(400).json({ message: "Something Went wrong", status: true });
  }
};

const createUser = async (req, res, next) => {
  try {
    const image = req.file.filename;
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
        image: image,
      });
      await user.save();
      res
        .status(200)
        .json({ message: "Successfully created a new user", status: true });
    }
  } catch (error) {
    res.status(400).json({ message: "Something Went wrong", status: true });
  }
};

const editUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (id) {
      const data = await User.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
          },
        }
      );
      console.log(req.file);
      if (req.file) {
        const image = req.file.filename;
        const imagePath = path.join(__dirname, "../public/images", image.image);
        fs.unlinkSync(imagePath);
        await User.findByIdAndUpdate({ _id: id }, { $set: { image: image } });
      }

      res
        .status(200)
        .json({ message: "User was successfully Updated", status: true });
    } else {
      res.status(400).json({ message: "Something Went wrong", status: true });
    }
  } catch (error) {
    res.status(400).json({ message: "Something Went wrong", status: true });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (id) {
      const image = await User.findById({ _id: id });
      const imagePath = path.join(__dirname, "../public/images", image.image);
      fs.unlinkSync(imagePath);
      await User.findByIdAndDelete({ _id: id });
      const data = await User.find({ is_admin: 0 });
      res.status(200).json({
        userData: data,
        message: "User was deleted successfully",
        status: true,
      });
    } else {
      res.status(400).json({ message: "Something Went wrong", status: false });
    }
  } catch (error) {
    res.status(400).json({ message: "Something Went wrong", status: true });
  }
};

const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (id) {
      const data = await User.findById({ _id: id });
      res.status(200).json({ userData: data, status: true });
    } else {
      res.status(400).json({ message: "Something Went wrong", status: true });
    }
  } catch (error) {
    res.status(400).json({ message: "Something Went wrong", status: true });
  }
};

const getAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(400).json({ message: "Token not provided" });
    }
    const token = authHeader.slice(6);
    const decodedToken = jwt.verify(token, "secret_key");
    const adminId = decodedToken.user_id;
    const adminData = await User.findById(adminId);
    if (adminData) {
      res.status(200).json({ adminData: adminData, status: true });
    } else {
      res.status(400).json({ message: "There is no user", status: false });
    }
  } catch (error) {
    res.status(400).json({ message: "Something Went wrong", status: true });
  }
};

//exporting this module
module.exports = {
  verifyLogin,
  getUsers,
  createUser,
  deleteUser,
  editUser,
  getUserById,
  getAdmin,
};
