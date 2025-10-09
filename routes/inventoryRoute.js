// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build single vehicle view
router.get("/detail/:inv_id", invController.buildByInventoryId)

// Route for intentional error
router.get("/cause-error", invController.causeError)

module.exports = router