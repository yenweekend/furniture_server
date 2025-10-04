const ctrls = require("../controllers/user.controller");
const { verifyToken, isAdmin } = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.post("/register", ctrls.signUp);
router.post("/login", ctrls.login);
router.post("/refreshtoken", ctrls.refreshAccessToken);

router.get("/account", verifyToken, ctrls.getAccount);
router.get("/me", ctrls.checkAuth);
router.get("/logout", ctrls.logout);
router.get("/verify", verifyToken, ctrls.verify); //used to check auth when user logged in
router.get("/forgotpassword", ctrls.forgotPassword);

router.put("/resetpassword/:resetToken", ctrls.resetPassword);

module.exports = router;
