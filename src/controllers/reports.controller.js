const Order = require('./../models/order')
const OrderItem = require('./../models/orderitem')
const Customer = require('./../models/customer')
const mongoose = require('mongoose')
const moment = require('moment')

class ReportsController {
    /**
     * Get customer Statistics
     * @param {*} req
     * @param {*} res
     */
     async getCustomerStatistics(req, res) {
        try {
            let filter = {}
            if (req.query.customer) {
                filter = { customer : mongoose.Types.ObjectId(req.query.customer) } 
            }
            let dateFilter = {};
            if (req.query.from_date) {
                dateFilter = { $gt: moment.utc(req.query.from_date).toDate() };
            }
            if (req.query.to_date) {
                dateFilter = {...dateFilter,  $lt: moment.utc(req.query.to_date).toDate() }
            }

            filter = { ...filter}

            if (Object.keys(dateFilter).length !== 0) {
                filter = { ...filter, createdAt: {...dateFilter}}
            } 
    
            let customers = await Order.aggregate( [
                { 
                    $match: filter 
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "customer",
                        foreignField: "_id",
                        as: "customer_detail"
                    },
                },
                {
                    $unwind: '$customer_detail'
                },
                {
                    $group: {
                        _id: "$customer",
                        customer: {
                            "$addToSet" : "$customer_detail"
                        },
                        total_sales: { 
                            $sum: "$total" 
                        },
                        total_orders: { 
                            $sum: 1 
                        },
                        total_inprogress_orders: {
                            $sum: {
                                $cond: [ { $eq: [ "$status", "in-process"] } , 1, 0 ]
                            }
                        },
                        total_complete_orders: {
                            $sum: {
                                $cond: [ { $eq: [ "$status", "complete"] } , 1, 0 ]
                            }
                        },
                        total_close_count: {
                            $sum: {
                                $cond: [ { $eq: [ "$status", "close"] } , 1, 0 ]
                            }
                        },
                        total_debit: {
                            $sum: {
                                $cond: [ { $eq: [ "$status", "complete"] } , "$total", 0 ]
                            }
                        },
                        total_paid: {
                            $sum: {
                                $cond: [ { $eq: [ "$status", "close"] } , "$total", 0 ]
                            }
                        },
                    }
                },
             ] );

             res.status(200).send(customers);
        } catch (e) {
            console.log(e);
            res.status(500).send(e)
        }
    }

    /**
     * Get customer Statistics
     * @param {*} req
     * @param {*} res
     */
     async getCustomerStatisticsById(req, res) {
        try {
            let filter = { customer : mongoose.Types.ObjectId(req.params.id) } 

            let dateFilter = {};
            if (req.query.from_date) {
                dateFilter = { $gt: moment.utc(req.query.from_date).toDate() };
            }
            if (req.query.to_date) {
                dateFilter = {...dateFilter,  $lt: moment.utc(req.query.to_date).toDate() }
            }

            filter = { ...filter}

            if (Object.keys(dateFilter).length !== 0) {
                filter = { ...filter, createdAt: {...dateFilter}}
            } 

            let orders = await Order.find(filter)
            res.status(200).send(orders)
        } catch (e) {
            res.status(500).send(e)
        }
    }

    /**
     * Get dashboard Statistics
     * @param {*} req
     * @param {*} res
     */
     async getDashboardStatistics(req, res) {
        try {
            let result = await Order.aggregate( [
                {
                    $group: {
                        _id: "",
                        total_sales: { 
                            $sum: "$total" 
                        },
                        total_orders: { 
                            $sum: 1 
                        },
                        total_inprogress_orders: {
                            $sum: {
                                $cond: [ { $eq: [ "$status", "in-process"] } , 1, 0 ]
                            }
                        },
                        total_complete_orders: {
                            $sum: {
                                $cond: [ { $eq: [ "$status", "complete"] } , 1, 0 ]
                            }
                        },
                        total_close_count: {
                            $sum: {
                                $cond: [ { $eq: [ "$status", "close"] } , 1, 0 ]
                            }
                        },
                        total_debit: {
                            $sum: {
                                $cond: [ { $eq: [ "$status", "complete"] } , "$total", 0 ]
                            }
                        },
                        total_paid: {
                            $sum: {
                                $cond: [ { $eq: [ "$status", "close"] } , "$total", 0 ]
                            }
                        },
                    }
                },
             ] );

             // get current year sales
             let current_year_sales = await Order.aggregate( [
                { 
                    $match: { 
                        createdAt : {
                            $gt: moment().startOf('year').toDate(),
                            $lt: moment().toDate() 
                        }
                    } 
                },
                {
                    $group: {
                        _id: { $month: "$createdAt"},
                        total_sales: { 
                            $sum: "$total" 
                        },
                    }
                },
             ] );
            result[0].current_year_sales = current_year_sales;

            // get group by product total
            let product_summary = await OrderItem.aggregate( [
                { 
                    $match: {} 
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "product",
                        foreignField: "_id",
                        as: "product_detail"
                    },
                },
                {
                    $unwind: '$product_detail'
                },
                {
                    $group: {
                        _id: "$product",
                        product: {
                            "$addToSet" : "$product_detail"
                        },
                        total_qty: { 
                            $sum: "$qty" 
                        },
                    }
                },
             ] );

            result[0].product_summary = product_summary;

            res.status(200).send(result)
        } catch (e) {
            console.log(e);
            res.status(500).send(e)
        }
    }

    /**
     * Get order Statistics
     * @param {*} req
     * @param {*} res
     */
    async getOrderStatistics(req, res) {
        try {
            let filter = {}
            let dateFilter = {};
            if (req.query.from_date) {
                dateFilter = { $gt: moment.utc(req.query.from_date).toDate() };
            }
            if (req.query.to_date) {
                dateFilter = {...dateFilter,  $lt: moment.utc(req.query.to_date).toDate() }
            }

            filter = { ...filter}

            if (Object.keys(dateFilter).length !== 0) {
                filter = { ...filter, createdAt: {...dateFilter}}
            }
            
            let group_by = { month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" }, year: { $year: "$createdAt" } };
            if (req.query.group_by === 'month') {
                group_by = { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
            } else if (req.query.group_by === 'year') {
                group_by = { year: { $year: "$createdAt" } };
            }
    
            let orders = await Order.aggregate( [
                { 
                    $match: filter 
                },
                {
                    $group: {
                        _id: group_by,
                        total_sales: { 
                            $sum: "$total" 
                        },
                        total_orders: { 
                            $sum: 1 
                        },
                        total_inprogress_orders: {
                            $sum: {
                                $cond: [ { $eq: [ "$status", "in-process"] } , 1, 0 ]
                            }
                        },
                        total_complete_orders: {
                            $sum: {
                                $cond: [ { $eq: [ "$status", "complete"] } , 1, 0 ]
                            }
                        },
                        total_close_count: {
                            $sum: {
                                $cond: [ { $eq: [ "$status", "close"] } , 1, 0 ]
                            }
                        },
                        total_debit: {
                            $sum: {
                                $cond: [ { $eq: [ "$status", "complete"] } , "$total", 0 ]
                            }
                        },
                        total_paid: {
                            $sum: {
                                $cond: [ { $eq: [ "$status", "close"] } , "$total", 0 ]
                            }
                        },
                    }
                },
             ] );

             res.status(200).send(orders);
        } catch (e) {
            console.log(e);
            res.status(500).send(e)
        }
    }
}

module.exports = ReportsController