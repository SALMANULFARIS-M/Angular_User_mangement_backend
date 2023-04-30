const router = require("express").Router();
const path = require('path');


//multer
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage: storage });
//getting controller modules
const userController = require("../controllers/user_controller");

router.post("/signup",userController.insertUser);
router.post("/login",userController.verifyLogin);
router.get("/user",userController.getUser);
router.put("/profile/:id",upload.single("image"),userController.profileUpdate);
router.delete("/logout",userController.logout);


module.exports = router;

