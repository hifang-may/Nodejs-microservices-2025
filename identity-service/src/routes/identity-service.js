const express = require("express");
const {
  resgiterUser,
  loginUser,
  logoutUser,
  refreshTokenUser,
} = require("../controllers/identity-controller");

const router = express.Router();

router.post("/register", resgiterUser);
router.post("/login", loginUser);
router.post("/refreshtoken", refreshTokenUser);
router.post("/logout", logoutUser);

module.exports = router;
