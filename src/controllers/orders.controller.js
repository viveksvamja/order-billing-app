const Order = require('./../models/order')
const OrderItem = require('./../models/orderitem')
const Customer = require('./../models/customer')
const Product = require('./../models/product');
const {validationError} = require('./../utils/helper')
const path = require("path");
const handlebars = require("handlebars");
const fs = require('fs');
const moment = require('moment')
const PAGE_SIZE = 5;

class OrdersController {
    /**
     * Get orders
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
            if (req.query.status) {
                filter = {...filter, 'status' : req.query.status } 
            }
            let orders = await Order.paginate(filter, { page: page, limit: PAGE_SIZE, sort: { _id: -1 } })
            res.status(200).send(orders);
        } catch (e) {
            res.status(500).send(e)
        }
    }

    /**
     * Show order by id
     * @param {*} req
     * @param {*} res
     */
     async show(req, res) {
        try {
            const id = req.params.id;
            let order = await Order.findById(id)
            res.status(201).send(order)
        } catch (e) {
            res.status(404).send(e)
        }
    }

    /**
     * Store order
     * @param {*} req
     * @param {*} res
     */
     async store(req, res) {
        const customer = await Customer.findById(req.body.customer)
        if (!customer) {
            res.status(422).send({
                error: "Invalid Customer"
            });
        }

        let items = req.body.items;
        if (!items || items.length == 0) {
            res.status(422).send({
                error: "Please add some items"
            });
        }

        try {
            // Auto increment order no
            let latestOrder = await Order.findOne().sort({
                "order_no": -1
            });
            let order_no = latestOrder ? latestOrder.order_no + 1 : 1;

            // save order details
            const order = new Order({
                order_no,
                ...req.body,
                status: "in-process"
            });
            await order.save()

            var subtotal = 0;
            var subtotal_loose = 0;
            let updatedOrder =  await new Promise((resolve,reject) => {
                items.forEach(async (item, index) => {
                    let product = await Product.findById(item.product);
                    if (!product) {
                        res.status(422).send({
                            error: "Invalid Product"
                        });
                    }

                    let item_total = 0;

                    if (item.type == 'Cartoon') {
                        item_total = product.price * item.qty * product.cartoon_qty;
                    } else if (item.type == 'Loose') {
                        item_total = product.loose_price * item.qty;
                    } else {
                        item_total = product.price * item.qty;
                    }
                    
                    let orderItem = new OrderItem({
                        order: order._id,
                        product: item.product,
                        qty: item.qty,
                        type: item.type,
                        total: item_total
                    });
                    await orderItem.save()

                    if (item.type === 'Cartoon') {
                        subtotal += item_total
                    } else {
                        subtotal_loose += item_total
                    }
                    
                    // Update order subtotal, discount, total
                    // Discout apply only on Cartoon line items
                    if (index === items.length - 1) {
                        let discount_percentage = customer.discount_percentage ? customer.discount_percentage : 0;
                        let discount = ((discount_percentage * subtotal) / 100);
                        let total = subtotal - discount + subtotal_loose;
                        let vat = total * 0.04;
                        let tax = total * 0.01;

                        order.subtotal = subtotal + subtotal_loose;
                        order.discount = discount;
                        order.vat = vat;
                        order.tax = tax;
                        order.total = Math.round(total + vat + tax);

                        let result =   await order.save();
                        resolve(result)
                    }
                })
            })

            res.status(201).send(updatedOrder)
        } catch (err) {
            const {error, code} = validationError(err);
            res.status(code).json({error});
        }
    }

    /**
     * Update order
     * @param {*} req
     * @param {*} res
     */
     async update(req, res) {
        const customer = await Customer.findById(req.body.customer)
        if (!customer) {
            res.status(422).send({
                error: "Invalid Customer"
            });
        }

        let items = req.body.items;
        if (!items || items.length == 0) {
            res.status(422).send({
                error: "Please add some items"
            });
        }

        try {
            const id = req.params.id;
            const order = await Order.findById(id)
            if (!order) {
                return res.status(404).send()
            }

            var subtotal = 0;
            var subtotal_loose = 0;
            let updatedOrder =  await new Promise((resolve,reject) =>{
                items.forEach(async (item, index) => {
                    let product = await Product.findById(item.product);
                    if (!product) {
                        res.status(422).send({
                            error: "Invalid Product"
                        });
                    }

                    let item_total = 0;

                    if (item.type == 'Cartoon') {
                        item_total = product.price * item.qty * product.cartoon_qty;
                    } else if (item.type == 'Loose') {
                        item_total = product.loose_price * item.qty;
                    } else {
                        item_total = product.price * item.qty;
                    }
                    
                    // Remove old entries
                    await OrderItem.deleteMany({order: order._id});

                    let orderItem = new OrderItem({
                        order: order._id,
                        product: item.product,
                        qty: item.qty,
                        type: item.type,
                        total: item_total
                    });
                    await orderItem.save()

                    if (item.type === 'Cartoon') {
                        subtotal += item_total
                    } else {
                        subtotal_loose += item_total
                    }
                    
                    // Update order subtotal, discount, total
                    // Discout apply only on Cartoon line items
                    if (index === items.length - 1) {
                        let discount_percentage = customer.discount_percentage ? customer.discount_percentage : 0;
                        let discount = ((discount_percentage * subtotal) / 100);
                        let total = subtotal - discount + subtotal_loose;
                        let vat = total * 0.04;
                        let tax = total * 0.01;
                        console.log(req.body);
                        order.order_date = req.body.order_date;
                        order.customer = req.body.customer;
                        order.status = req.body.status;
                        order.subtotal = subtotal + subtotal_loose;
                        order.discount = discount;
                        order.vat = vat;
                        order.tax = tax;
                        order.total = Math.round(total + vat + tax);

                        let result =   await order.save();
                        resolve(result)
                    }
                })
            })

            res.status(201).send(updatedOrder)
        } catch (err) {
            const {error, code} = validationError(err);
            res.status(code).json({error});
        }
    }

    /**
     * Delete order
     * @param {*} req
     * @param {*} res
     */
     async delete(req, res) {
        try {
            const id = req.params.id;
            let order = await Order.findById(id)
            if (!order) {
                return res.status(404).send()
            }
            await order.remove()
            res.status(200).send(order)
        } catch (e) {
            res.status(500).send(e)
        }
    }

    /**
     * Generate order invoice
     * @param {*} req
     * @param {*} res
     */
     async invoice(req, res) {
        try {
            const id = req.params.id;
            let order = await Order.findById(id);

            let items = [];
            let total_box_qty = 0;
            let total_qty = 0;
    
            order.orderitems.forEach((item, index) => {
                items[index] = {
                    name: item.product.name,
                    box_qty: item.product.cartoon_qty * item.qty,
                    qty: item.qty,
                    rate: item.product.price,
                    amount: item.total,
                };

                total_box_qty += item.product.cartoon_qty * item.qty;
                total_qty += item.qty;
            })

            console.log(items);

            var pdf = require('html-pdf');

            var dataBinding = {
                invoiceNo: order.order_no,
                invoice_date: moment(order.order_date).format('MMMM D, YYYY'),
                invoice_due_date: moment(order.order_date).add(30, 'days').format('MMMM D, YYYY'),
                customerName: order.customer.name,
                customerAddress: order.customer.shipping_address,
                customerCity: order.customer.city,
                gstNumber: order.customer.gst_number ? order.customer.gst_number : "",
                cstNumber: order.customer.cst_number ? order.customer.cst_number : "",
                items: items,
                total_box_qty: total_box_qty,
                total_qty: total_qty,
                subtotal: order.subtotal,
                discount: order.discount,
                vat: order.vat,
                tax: order.tax,
                total: order.total,
                isWatermark: order.status == 'close' ? true : false,
                logo_url: 'file://' + path.join(process.cwd(), './src/views/images/logo.png')
            }

            var templateHtml = fs.readFileSync(path.join(process.cwd(), './src/views/invoice.html'), 'utf8');
            var template = handlebars.compile(templateHtml);
            var html = template(dataBinding);

            var options = {
                format: 'A4',
            };

            let response =  await new Promise((resolve,reject) => {
                pdf.create(html, options).toFile(`./storage/invoice/${order.order_no}.pdf`, function(err, res) {
                    if (err) reject(err);
                    resolve(res);
                });
            });

            res.download(response.filename);
        } catch (e) {
            console.log(e);
            res.status(404).send(e)
        }
    }
}

module.exports = OrdersController