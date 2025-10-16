const express = require("express")
const router = new express.Router()
const favoritesController = require("../controllers/favoritesController")
const utilities = require("../utilities")

console.log("Loaded favoritesRoutes:", __filename)

// Toggle favorite
router.post(
  "/toggle",
  utilities.checkLogin,
  utilities.handleErrors(favoritesController.toggleFavorite)
)

// My Favorites
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(favoritesController.listFavorites)
)

module.exports = router