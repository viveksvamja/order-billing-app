const mongoose = require('mongoose')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
        validate(value) {
            if (!validator.isAlphanumeric(validator.blacklist(value, ' '), ['en-IN'])) {
                throw new Error('Invalid product name')
            }
        }
    },
    price: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Invalid price.')
            }
        }
    },
    cartoon_qty: {
        type: Number,
        required: true,
        validate(value) {
            if (value <= 0) {
                throw new Error('Invalid cartoon quantity.')
            }
        }
    },
    loose_price: {
        type: Number,
        trim: true,
        default: 0
    },
}, {
    timestamps: true
});

schema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', schema);

module.exports = Product
