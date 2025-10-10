const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null
  })
}

// Build detail view by inventory id
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id
    const vehicleData = await invModel.getVehicleById(inv_id)

    if (!vehicleData) {
      let nav = await utilities.getNav()
      return res.status(404).render("errors/error", {
        title: "Vehicle Not Found",
        message: "Sorry, the requested vehicle could not be found.",
        nav,
      })
    }

    let nav = await utilities.getNav()
    const detail = utilities.buildVehicleDetailHTML(vehicleData)

    res.render("./inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      detail,
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

// Intentional Error
invCont.causeError = async function (req, res, next) {
  try {
    throw new Error("Intentional 500-type error.")
  } catch (err) {
    next(err)
  }
}

/* ****************************************
*  Deliver Inventory Management View
* *************************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message: req.flash("notice"),
    })
  } catch (error) {
    next(error)
  }
}

// Show Add Classification Form
invCont.buildAddClassification = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: req.flash("notice"),
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

// Process Add Classification Form
invCont.addClassification = async (req, res, next) => {
  try {
    const { classification_name } = req.body
    const newClass = await invModel.addClassification(classification_name)

    if (newClass) {
      req.flash("notice", "Classification added successfully!")
      const nav = await utilities.getNav()
      res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        message: req.flash("notice"),
        errors: null
      })
    } else {
      const nav = await utilities.getNav()
      res.status(500).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        message: "Could not add classification.",
        errors: null
      })
    }
  } catch (error) {
    next(error)
  }
}

// Show Add Inventory Form
invCont.buildAddInventory = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      message: req.flash("notice"),
      errors: null,
      inv_make: '',
      inv_model: '',
      inv_year: '',
      inv_description: '',
      inv_image: '/images/no-image.png',
      inv_thumbnail: '/images/no-image-tn.png',
      inv_price: '',
      inv_miles: '',
      inv_color: ''
    })
  } catch (error) {
    next(error)
  }
}

// Process Add Inventory Form
invCont.addInventory = async (req, res, next) => {
  try {
    const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body

    const newVehicle = await invModel.addVehicle({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })

    if (newVehicle) {
      req.flash("notice", `${inv_make} ${inv_model} added successfully!`)
      const nav = await utilities.getNav()
      res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        message: req.flash("notice"),
        errors: null
      })
    } else {
      const nav = await utilities.getNav()
      res.status(500).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        message: "Vehicle could not be added.",
        errors: null
      })
    }
  } catch (error) {
    next(error)
  }
}

module.exports = invCont