// routes/chart.js
const express = require('express');
const {
  getSalesOverview,
  getTopSellingProducts,
  getRevenueByCategory,
  getCustomerDemographics,
  getLowSellingProducts
} = require('../controllers/chartController');

const router = express.Router();

router.get('/sales-overview', getSalesOverview);
router.get('/top-selling-products', getTopSellingProducts);
router.get('/revenue-by-category', getRevenueByCategory);
router.get('/customer-demographics', getCustomerDemographics);
router.get('/low-selling-products', getLowSellingProducts);

module.exports = router;
