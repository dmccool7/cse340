// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const accountValidate = require('../utilities/account-validation')

// Deliver Login View
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Deliver Registration View
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Post Registration
// Process the registration data
router.post(
  "/register",
  accountValidate.registationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  (req, res) => {
    res.status(200).send("login process")
  }
)

module.exports = router