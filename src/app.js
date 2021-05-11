const express = require('express')
const cors = require('cors')
require('./connection/mongoose')

// Get routers
const routes = require('./routers/routes')

// Initialize express server
const app = express()

app.use(express.json())
app.use(cors())

// Use router
app.use('/', routes);

module.exports = app