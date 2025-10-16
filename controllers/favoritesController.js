const favoritesModel = require("../models/favorites-model")

const favoritesController = {}

// Toggle favorite
favoritesController.toggleFavorite = async (req, res, next) => {
  try {
    const accountData = res.locals.accountData
    if (!accountData) return res.status(401).redirect("/account/login")

    const account_id = accountData.account_id
    const inv_id = parseInt(req.body.inv_id)

    const favoriteIds = await favoritesModel.getFavoriteIds(account_id)
    let success

    if (favoriteIds.includes(inv_id)) {
      success = await favoritesModel.removeFavorite(account_id, inv_id)
    } else {
      success = await favoritesModel.addFavorite(account_id, inv_id)
    }

    if (!success) req.flash("notice", "Could not update favorite.")
    res.redirect("back")
  } catch (error) {
    next(error)
  }
}

// List favorites
favoritesController.listFavorites = async (req, res, next) => {
  try {
    const accountData = res.locals.accountData
    if (!accountData) return res.status(401).redirect("/account/login")

    const favorites = await favoritesModel.getFavoritesByUser(accountData.account_id)
    const nav = await require("../utilities").getNav()

    res.render("favorites/list", {
      title: "My Favorites",
      nav,
      favorites,
      notice: req.flash("notice") || null,
      errors: []
    })
  } catch (error) {
    next(error)
  }
}

module.exports = favoritesController