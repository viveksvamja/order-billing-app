const jwt = require('jsonwebtoken');
const User = require('./../models/user')

if (process.env.NODE_ENV == 'development') {
    const dotenv = require('dotenv')
    dotenv.config()
}

const auth = async function (req, res, next) {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({_id: decode._id, 'tokens.token': token})
        if (!user) {
            throw new Error()
        }
        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({error : 'You are not authorized!'})
    }
}

module.exports = auth