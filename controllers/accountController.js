// Require
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const accountController = {}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver Account Management view
 * ************************************ */
async function buildAccountManagement(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const accountData = res.locals.accountData

    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      notice: req.flash("notice"),
      account_firstname: accountData.account_firstname,
      account_type: accountData.account_type,
      account_id: accountData.account_id
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
*  Deliver Update Account View
* *************************************** */
async function buildUpdateAccount(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  const nav = await utilities.getNav()
  const accountData = res.locals.accountData

  res.render("account/update", {
    title: "Update Account Information",
    nav,
    errors: null,
    notice: req.flash("notice"),
    accountData: { 
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email
    }
  })
}

/* ****************************************
 *  Process Account Info Update
 * *************************************** */
async function updateAccount(req, res, next) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body

  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    parseInt(account_id)
  )

  if (updateResult) {
    req.flash("notice", "Account information updated successfully.")
    const accountData = await accountModel.getAccountById(parseInt(account_id))
    let nav = await utilities.getNav()
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      notice: req.flash("notice"),
      account_firstname: accountData.account_firstname,
      account_type: accountData.account_type,
      account_id: accountData.account_id
    })
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.redirect(`/account/update/${account_id}`)
  }
}

/* ****************************************
 *  Process Password Change
 * *************************************** */
async function updatePassword(req, res, next) {
  const { account_password, account_id } = req.body
  const parsedId = parseInt(account_id)

  if (!parsedId) {
    req.flash("notice", "Invalid account ID.")
    return res.redirect("/account/")
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const updateResult = await accountModel.updatePassword(hashedPassword, parsedId)

    const accountData = await accountModel.getAccountById(parsedId)
    let nav = await utilities.getNav()

    if (!accountData) {
      req.flash("notice", "Account not found.")
      return res.redirect("/account/")
    }

    if (updateResult) {
      req.flash("notice", "Password updated successfully.")
    } else {
      req.flash("notice", "Password update failed.")
    }
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      notice: req.flash("notice"),
      account_firstname: accountData.account_firstname,
      account_type: accountData.account_type,
      account_id: accountData.account_id
    })
  } catch (error) {
    console.error(error)
    req.flash("notice", "Error updating password.")
    res.redirect(`/account/update/${account_id}`)
  }
}

/* ****************************************
*  Logout Account
* *************************************** */
async function accountLogout(req, res, next) {
  try {
    res.clearCookie("jwt")
    req.session = null
    res.redirect("/")
  } catch (error) {
    next(error)
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildUpdateAccount, updateAccount, updatePassword, accountLogout }