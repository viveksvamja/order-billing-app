const express = require('express')
const router = express.Router()
const auth = require('./../middlewares/auth')

const ProductsController = require('./../controllers/products.controller')
const controller = new ProductsController();

router.get('/', auth, (req, res) => controller.index(req, res));
router.post('/', auth, (req, res) => controller.store(req, res));
router.get('/:id', auth, (req, res) => controller.show(req, res));
router.put('/:id', auth, (req, res) => controller.update(req, res));
router.delete('/:id', auth, (req, res) => controller.delete(req, res));

module.exports = router