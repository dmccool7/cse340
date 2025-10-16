const pool = require("../database/")

const favoritesModel = {}

// Add a favorite
favoritesModel.addFavorite = async (account_id, inv_id) => {
  try {
    const sql = `
      INSERT INTO favorites (account_id, inv_id)
      VALUES ($1, $2)
      ON CONFLICT (account_id, inv_id) DO NOTHING
    `
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("Add favorite error:", error)
    return false
  }
}

// Remove a favorite
favoritesModel.removeFavorite = async (account_id, inv_id) => {
  try {
    const sql = `DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2`
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("Remove favorite error:", error)
    return false
  }
}

// Get all favorites
favoritesModel.getFavoritesByUser = async (account_id) => {
  try {
    const sql = `
      SELECT f.inv_id, i.inv_make, i.inv_model, i.inv_price, f.created_at
      FROM favorites f
      JOIN inventory i ON f.inv_id = i.inv_id
      WHERE f.account_id = $1
      ORDER BY f.created_at DESC
      `
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("Get favorites error:", error)
    return []
  }
}

// Get favorite vehicle IDs
favoritesModel.getFavoriteIds = async (account_id) => {
  try {
    const sql = `SELECT inv_id FROM favorites WHERE account_id = $1`
    const result = await pool.query(sql, [account_id])
    return result.rows.map(r => r.inv_id)
  } catch (error) {
    console.error("Get favorite IDs error:", error)
    return []
  }
}

module.exports = favoritesModel