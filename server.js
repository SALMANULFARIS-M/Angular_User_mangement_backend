const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user_route");
const adminRoutes = require("./routes/admin_route");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
require('dotenv').config()
app.use(
  cors({
    credentials: true,
    origin: [process.env.ORIGIN],
  })
);

app.use(express.static(path.join(__dirname, "public/images/")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);

mongoose
  .connect(process.env.MONGODBSERVER, {
    useNewUrlParser: true,
  })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Database connected and Working On" + process.env.PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
