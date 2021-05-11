const app = require('./app')

if (process.env.NODE_ENV == 'development') {
    const dotenv = require('dotenv')

    // Load environment configuration
    dotenv.config()
}

const port = process.env.PORT

app.listen(port, () => {
    console.log("Server is up and running on port " + port);
})