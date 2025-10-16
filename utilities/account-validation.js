const accountModel = require("../models/account-model")
const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registrationRules = () => {
return [
    // firstname is required and must be string
    body("account_firstname")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 1 })
    .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 2 })
    .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the database
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // refer to validator.js docs
    .withMessage("A valid email is required.")
    .custom(async (account_email) => {
      const emailExists = await accountModel.checkExistingEmail(account_email)
      if (emailExists){
        throw new Error("Email exists. Please log in or use different email")
      }
    }),

    // password is required and must be strong password
    body("account_password")
    .trim()
    .notEmpty()
    .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    .withMessage("Password does not meet requirements."),
]
}

/*  **********************************
*  Login Data Validation Rules
* ********************************* */
validate.loginRules = () => {
  return [
    // Email must be valid
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // Password can't be empty
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
 * Check login data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}

/* ***************************
 *  Validation rules for update
 * ************************** */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("First name is required."),
    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Last name is required."),
    body("account_email")
      .isEmail()
      .withMessage("A valid email is required.")
      .custom(async (value, { req }) => {
        const existingAccount = await accountModel.getAccountByEmail(value)
        if (existingAccount && existingAccount.account_id != req.body.account_id) {
          throw new Error("That email already exists. Please use another.")
        }
      }),
  ]
}

/* ***************************
 *  Validation rules for password
 * ************************** */
validate.passwordRules = () => {
  return [
    body("account_password")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters and include uppercase, number, and special character."),
  ]
}

/* ***************************
 *  Handle validation results for account info update
 * ************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const account_id = parseInt(req.body.account_id)
    // Fetch full account info from DB
    const accountData = await accountModel.getAccountById(account_id)
    let nav = await require("../utilities").getNav()
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      notice: req.flash("notice"),
      accountData, // full data for template
    })
    return
  }
  next()
}

/* ***************************
 *  Handle validation results for password update
 * ************************** */
validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  const account_id = parseInt(req.body.account_id)
  if (!account_id) {
    req.flash("notice", "Invalid account ID.")
    return res.redirect("/account/")
  }
  const accountData = await accountModel.getAccountById(account_id)
  if (!accountData) {
    req.flash("notice", "Account not found.")
    return res.redirect("/account/")
  }
  if (!errors.isEmpty()) {
    let nav = await require("../utilities").getNav()
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      notice: req.flash("notice"),
      accountData, // full account info for template
    })
    return
  }
  next()
}

module.exports = { 
  registrationRules: validate.registrationRules,
  checkRegData: validate.checkRegData,
  loginRules: validate.loginRules,
  checkLoginData: validate.checkLoginData,
  updateAccountRules: validate.updateAccountRules,
  passwordRules: validate.passwordRules,
  checkUpdateData: validate.checkUpdateData,
  checkPasswordData: validate.checkPasswordData
}