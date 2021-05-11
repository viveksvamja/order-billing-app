const Customer = require('./../models/customer')
const {validationError} = require('./../utils/helper')
const PAGE_SIZE = 5;

class CustomersController {
    /**
     * Get customers
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
            let customers = {};
            if (page != -1) {
                customers = await Customer.paginate(filter, { page: page, limit: PAGE_SIZE })
            } else {
                customers = await Customer.find({})
            }
    
            res.status(200).send(customers);
        } catch (e) {
            console.log(e)
            res.status(500).send(e)
        }
    }

    /**
     * Show customer by id
     * @param {*} req
     * @param {*} res
     */
     async show(req, res) {
        try {
            const id = req.params.id;
            let customer = await Customer.findById(id)
            res.status(201).send(customer)
        } catch (e) {
            res.status(404).send(e)
        }
    }

    /**
     * Store customer
     * @param {*} req
     * @param {*} res
     */
     async store(req, res) {
        const customer = new Customer(req.body)
        try {
            await customer.save()
            res.status(201).send(customer)
        } catch (err) {
            const {error, code} = validationError(err);
            res.status(code).json({error});
        }
    }

    /**
     * Update customer
     * @param {*} req
     * @param {*} res
     */
     async update(req, res) {
        try {
            const updates = Object.keys(req.body)
            const allowUpdates = ['name', 'contact_number', 'email', 'gst_number', 'cst_number', 'city', 'shipping_address', 'discount_percentage']

            const isValidData = updates.every((update) => allowUpdates.includes(update))
            if (!isValidData || !updates.length) {
                return res.status(400).send({error: "Invalid data"})
            }

            const id = req.params.id;
            let customer = await Customer.findById(id)
            if (!customer) {
                return res.status(404).send()
            }

            updates.forEach((update) => customer[update] = req.body[update])

            await customer.save()
            res.status(200).send(customer)
        } catch (err) {
            const {error, code} = validationError(err);
            res.status(code).json({error});
        }
    }

    /**
     * Delete customer
     * @param {*} req
     * @param {*} res
     */
     async delete(req, res) {
        try {
            const id = req.params.id;
            let customer = await Customer.findById(id)
            if (!customer) {
                return res.status(404).send()
            }
            await customer.remove()
            res.status(200).send(customer)
        } catch (e) {
            res.status(500).send(e)
        }
    }
}

module.exports = CustomersController