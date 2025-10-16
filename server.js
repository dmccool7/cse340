/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")
const session = require("express-session")
const pool = require('./database/')
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")

// debug: log incoming requests
app.use((req, res, next) => {
  console.log(`>> REQ ${req.method} ${req.originalUrl}`)
  next()
})

/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(cookieParser())
app.use(utilities.checkJWTToken)

app.use((req, res, next) => {
  const token = req.cookies.jwt
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      res.locals.loggedin = true
      res.locals.accountData = decoded
    } catch (err) {
      res.locals.loggedin = false
    }
  } else {
    res.locals.loggedin = false
  }
  next()
})

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(static)
// Index Route
app.get("/", utilities.handleErrors(baseController.buildHome))
// Inventory routes
app.use("/inv", require("./routes/inventoryRoute"))
// Account routes
app.use("/account", require("./routes/accountRoute"))
// Favorites
app.use("/favorites", require("./routes/favoritesRoutes"))
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  console.error(err.stack || err)
  let message
  if (err.status === 404) message = err.message
  else message = 'Oh no! There was a crash. Maybe try a different route?'
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

// DEBUG: detailed routes dump
function dumpRoutes() {
  console.log("---- Registered routes ----")
  app._router.stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(",")
      console.log(methods.padEnd(7), layer.route.path)
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      layer.handle.stack.forEach(r => {
        if (r.route) {
          const methods = Object.keys(r.route.methods).map(m => m.toUpperCase()).join(",")
          // attempt to show mount path for the parent if available
          console.log(methods.padEnd(7), r.route.path)
        }
      })
    }
  })
  console.log("---------------------------")
}
dumpRoutes()

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
