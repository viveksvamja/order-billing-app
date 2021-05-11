const express = require('express');
const router = express.Router();

const user = require('./../routers/user')
const customer = require('./../routers/customer')
const product = require('./../routers/product')
const order = require('./../routers/order')
const report = require('./../routers/report')

router.use('/auth', user);
router.use('/customers', customer);
router.use('/products', product);
router.use('/orders', order);
router.use('/reports', report);

module.exports = router