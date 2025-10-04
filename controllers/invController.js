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

module.exports = invCont