const mongoose = require('mongoose')
const OrderItem = require('./../models/orderitem')
const Customer = require('./../models/customer')
const mongoosePaginate = require('mongoose-paginate');

const schema = new mongoose.Schema({
    order_no: {
        type: Number,
        required: true,
        trim: true,
    },
    order_date: {
        type: Date,
        required: true,
        trim: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Customer',
        autopopulate: true
    },
    subtotal: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Invalid subtotal.')
            }
        }
    },
    discount: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Invalid discount.')
            }
        }
    },
    vat: {
        type: Number,
        default: 0,
    },
    tax: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Invalid total.')
            }
        }
    },
    status: {
        type: String,
        default: 'in-process',
        lowercase: true,
        validate(status) {
            // All statuses
            // in-process - Order placed and processing
            // complete - Order delivered but payment pending
            // close - Order delivered and paid
            let statuses = ['in-process', 'complete', 'close']
            if (!statuses.includes(status)) {
                throw new Error('Invalid order status.')
            }
        }
    },
}, {
    timestamps: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

schema.virtual('orderitems', {
    ref: "OrderItem",
    localField: "_id",
    foreignField: "order",
    autopopulate: true
})

schema.pre('remove', async function (next) {
    const order = this
    await OrderItem.deleteMany({order: order._id})
    next()
})

schema.plugin(require('mongoose-autopopulate'));

schema.plugin(mongoosePaginate);

const Order = mongoose.model('Order', schema);

module.exports = Order
