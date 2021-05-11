const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Order"
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product",
        autopopulate: true
    },
    type: {
        type: String,
        enum : ['Cartoon','Box','Loose'],
        default: 'Cartoon',
    },
    qty: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 1) {
                throw new Error('Invalid Qty.')
            }
        }
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
}, {
    timestamps: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

schema.plugin(require('mongoose-autopopulate'));

const OrderItem = mongoose.model('OrderItem', schema);

module.exports = OrderItem
