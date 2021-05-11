const mongoose = require('mongoose')

if (process.env.NODE_ENV == 'development') {
    const dotenv = require('dotenv')

    // Load environment configuration   
    dotenv.config()
}

mongoose.connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})