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
            if (!validator.isAlpha(validator.blacklist(value, ' '), ['en-IN'])) {
                throw new Error('Invalid customer name')
            }
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email address')
            }
        }
    },
    gst_number: {
        type: String,
        required: [function() { return !this.cst_number; }, 'GST number/CST number required'],
        trim: true,
        minlength: 15,
        maxlength: 15,
        index: {
            unique: true,
            partialFilterExpression: {gst_number: {$type: "string"}}
        },
        validate(value) {
            if (!validator.isAlphanumeric(value, 'en-IN')) {
                throw new Error('GST number Invalid');
            }
        }
    },
    cst_number: {
        type: String,
        required: [function() { return !this.gst_number; }, 'GST number/CST number required'],
        trim: true,
        minlength: 15,
        maxlength: 15,
        index: {
            unique: true,
            partialFilterExpression: {cst_number: {$type: "string"}}
        },
        validate(value) {
            if (!validator.isAlphanumeric(value, 'en-IN')) {
                throw new Error('Invalid CST number');
            }
        }
    },
    contact_number: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 16,
        unique: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    shipping_address: {
        type: String,
        trim: true,
        minlength: 6
    },
    discount_percentage: {
        type: Number,
        trim: true,
        validate(value) {
            if (value < 0 || value > 100) {
                throw new Error('Discount percentage must be  between 0-100')
            }
        }
    },
}, {
    timestamps: true
});

schema.virtual('order', {
    ref: "Order",
    localField: "_id",
    foreignField: "customer"
})

schema.plugin(mongoosePaginate);

const Customer = mongoose.model('Customer', schema);

module.exports = Customer
