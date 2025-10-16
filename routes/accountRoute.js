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
  accountValidate.registrationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

// Deliver the update account view
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
)

// Process Account Info Update
router.post(
  "/update",
  utilities.checkLogin,
  accountValidate.updateAccountRules(),
  accountValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Process Password Update
router.post(
  "/update-password",
  utilities.checkLogin,
  accountValidate.passwordRules(),
  accountValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

// Process logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout))

module.exports = router