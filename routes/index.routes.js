const router = require("express").Router()
const {register,registerPage,loginPage,login,lupaPassword,resetPasswordPage,resetPassword} = require("../controllers/index.controllers")


router.post("/register",register)
router.get("/register",registerPage)
router.get("/login",loginPage)
router.post("/login",login)
router.post("/lupa-password",lupaPassword)
router.get("/reset-password",resetPasswordPage)
router.post("/reset-password",resetPassword)

module.exports = router