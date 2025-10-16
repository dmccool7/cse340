// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const { body, validationResult } = require("express-validator")
const invValidate = require("../utilities/inv-validation")

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
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

/* ****************************************
 *  Add Inventory Routes
 **************************************** */

// Show the Add Inventory form
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

// Process Add Inventory form
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

//
// Inventory Data as JSON
//
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

/* ***************************************
*  Show Edit Inventory Form
*****************************************/
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.buildEditInventory)
)

/* ****************************************
*  Update Inventory Route
*****************************************/
router.post(
  "/update",
  utilities.handleErrors(invController.updateInventory)
)

module.exports = router