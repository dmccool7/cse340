// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const { body, validationResult } = require("express-validator")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build single vehicle view
router.get("/detail/:inv_id", invController.buildByInventoryId)

// Route for intentional error
router.get("/cause-error", invController.causeError)

// route for management view
router.get("/", utilities.handleErrors(invController.buildManagement))

/* ****************************************
*  Add Classification Routes
*****************************************/

// Show the Add Classification form
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

// Process Add Classification form
router.post(
  "/add-classification",
  // server-side validation middleware
  body("classification_name")
    .trim()
    .notEmpty().withMessage("Please enter a classification name.")
    .matches(/^[A-Za-z0-9]+$/).withMessage("No spaces or special characters allowed."),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const nav = await utilities.getNav()
      return res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        message: null,
        errors: errors.array()
      })
    }
    next()
  },
  utilities.handleErrors(invController.addClassification)
)

// Show Add Inventory Form
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

// Process Add Inventory Form
router.post("/add-inventory", utilities.handleErrors(invController.addInventory))

module.exports = router