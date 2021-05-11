const express = require('express')
const router = express.Router()
const auth = require('./../middlewares/auth')

const ReportsController = require('./../controllers/reports.controller')
const controller = new ReportsController();

router.get('/customer-statistics', auth, (req, res) => controller.getCustomerStatistics(req, res));
router.get('/customer-statistics/:id', auth, (req, res) => controller.getCustomerStatisticsById(req, res));
router.get('/dashboard-statistics', auth, (req, res) => controller.getDashboardStatistics(req, res));
router.get('/order-statistics', auth, (req, res) => controller.getOrderStatistics(req, res));


module.exports = router