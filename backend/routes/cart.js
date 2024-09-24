const express = require('express');
const {
  addCartItem,
  getCartItems,
  removeCartItem,
  updateCartItem,
  checkout,// Ensure this is properly imported
  checkStock, // Ensure this is properly imported
} = require('../controllers/cartController'); // Check the correct path

const router = express.Router();

// Routes for Cart
router.post('/', addCartItem);
router.get('/:userId', getCartItems);
router.delete('/:id', removeCartItem);
router.put('/:id', updateCartItem);
router.get('/check-stock/:productId', checkStock);
// Checkout route
router.post('/checkout', checkout); // Ensure checkout is correctly assigned

module.exports = router;
