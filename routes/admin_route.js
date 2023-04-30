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
const adminController = require("../controllers/admin_controller");

router.get("/",adminController.getAdmin);
router.post("/login",adminController.verifyLogin);
router.get("/users",adminController.getUsers);
router.get("/user/:id",adminController.getUserById)
router.post("/createuser",upload.single("image"),adminController.createUser);
router.put("/edituser/:id",upload.single("image"),adminController.editUser);
router.delete("/deleteuser/:id", adminController.deleteUser);


module.exports = router;