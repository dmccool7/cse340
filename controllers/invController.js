const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

const DEFAULT_IMAGE = "/images/vehicles/no-image.png"
const DEFAULT_THUMB = "/images/vehicles/no-image-tn.png"

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
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
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
      res.redirect("/inv/")
    } else {
      const nav = await utilities.getNav()
      req.flash("notice", "Could not add classification.")
      res.status(500).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        message: req.flash("notice"),
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
      inv_image: DEFAULT_IMAGE,
      inv_thumbnail: DEFAULT_THUMB,
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

    const cleanImage = (inv_image && inv_image.trim()) ? inv_image.trim() : DEFAULT_IMAGE
    const cleanThumb = (inv_thumbnail && inv_thumbnail.trim()) ? inv_thumbnail.trim() : DEFAULT_THUMB

    const newVehicle = await invModel.addVehicle({
      classification_id,
      inv_make: inv_make && inv_make.trim(),
      inv_model: inv_model && inv_model.trim(),
      inv_year,
      inv_description,
      inv_image: cleanImage,
      inv_thumbnail: cleanThumb,
      inv_price,
      inv_miles,
      inv_color
    })

    if (newVehicle) {
      req.flash("notice", `${inv_make} ${inv_model} added successfully!`)
      res.redirect("/inv/")
    } else {
      const nav = await utilities.getNav()
      req.flash("notice", "Vehicle could not be added.")
      res.status(500).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        message: req.flash("notice"),
        errors: null
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body

    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    )

    if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model
      req.flash("notice", `The ${itemName} was successfully updated.`)
      res.redirect("/inv/")
    } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", "Sorry, the update failed.")
      res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect,
        errors: null,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async (req, res, next) => {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
  } catch (error) {
    next(error)
  }
}

module.exports = invCont