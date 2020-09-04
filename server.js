const express = require('express')
const path = require('path')

const app = express()

//here we are configuring dist to serve app files
app.use(express.static('dist'))

// this * route is to serve project on different page routes except root `/`
app.get(/.*/, function (req, res) {
	res.sendFile(path.join(__dirname, '/dist/index.html'))
})

//database config


const port = process.env.PORT || 3000
app.listen(port)
console.log(`app is listening on port: ${port}`)
