const Product = require('./../models/product')
const {validationError} = require('./../utils/helper')
const PAGE_SIZE = 5;

class ProductsController {
    /**
     * Get products
     * @param {*} req
     * @param {*} res
     */
     async index(req, res) {
        try {
            let filter = {}
            const page = parseInt(req.query.page) || 1;
            if (req.query.search) {
                filter = { 'name' : { '$regex' : req.query.search, '$options' : 'i' } } 
            }
            let products = {};
            if (page != -1) {
                products = await Product.paginate(filter, { page: page, limit: PAGE_SIZE })
            } else {
                products = await Product.find({})
            }
            res.status(200).send(products);
        } catch (e) {
            res.status(500).send(e)
        }
    }

    /**
     * Show product by id
     * @param {*} req
     * @param {*} res
     */
     async show(req, res) {
        try {
            const id = req.params.id;
            let product = await Product.findById(id)
            res.status(201).send(product)
        } catch (e) {
            res.status(404).send(e)
        }
    }

    /**
     * Store product
     * @param {*} req
     * @param {*} res
     */
     async store(req, res) {
        const product = new Product(req.body)
        try {
            await product.save()
            res.status(201).send(product)
        } catch (err) {
            const {error, code} = validationError(err);
            res.status(code).json({error});
        }
    }

    /**
     * Update product
     * @param {*} req
     * @param {*} res
     */
     async update(req, res) {
        try {
            const updates = Object.keys(req.body)
            const allowUpdates = ['name', 'price', 'cartoon_qty', 'loose_price']

            const isValidData = updates.every((update) => allowUpdates.includes(update))
            if (!isValidData || !updates.length) {
                return res.status(400).send({error: "Invalid data"})
            }

            const id = req.params.id;
            let product = await Product.findById(id)
            if (!product) {
                return res.status(404).send()
            }

            updates.forEach((update) => product[update] = req.body[update])

            await product.save()
            res.status(200).send(product)
        } catch (err) {
            const {error, code} = validationError(err);
            res.status(code).json({error});
        }
    }

    /**
     * Delete product
     * @param {*} req
     * @param {*} res
     */
     async delete(req, res) {
        try {
            const id = req.params.id;
            let product = await Product.findById(id)
            if (!product) {
                return res.status(404).send()
            }
            await product.remove()
            res.status(200).send(product)
        } catch (e) {
            res.status(500).send(e)
        }
    }
}

module.exports = ProductsController