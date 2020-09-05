const express = require('express')
var bodyParser = require('body-parser')
const path = require('path')
const pgp = require('pg-promise')()
const db = pgp(process.env.DATABASE_URL || '***REMOVED***')

const app = express()

//here we are configuring dist to serve app files
app.use(express.static('dist'))
app.use(bodyParser.json())
// this * route is to serve project on different page routes except root `/`
app.get(/.*/, function (req, res) {
	res.sendFile(path.join(__dirname, '/dist/index.html'))
})

//database config
app.post('/database/user', async (req, res) => {
	console.log(req.body)
	await db.none('INSERT INTO users("email", "username") VALUES($1, $2)', [req.body.email, req.body.username])
	.then(()=>res.send("Success"))
	.catch(e=>{
		res.send(e)
		console.log(e)
	})
})

const port = process.env.PORT || 3000
app.listen(port)
console.log(`app is listening on port: ${port}`)
