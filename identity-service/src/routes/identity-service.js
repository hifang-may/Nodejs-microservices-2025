const express = require("express");
const {
  resgiterUser, loginUser
} = require("../controllers/identity-controller");

const router = express.Router();

router.post("/register", resgiterUser);
router.post("/login", loginUser);

module.exports = router;
