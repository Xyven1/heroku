const express = require('express')
var bodyParser = require('body-parser')
const path = require('path')
const {OAuth2Client} = require('google-auth-library')
const client = new OAuth2Client('***REMOVED***')
const pgp = require('pg-promise')()
const db = pgp(process.env.DATABASE_URL || '***REMOVED***')

const app = express()
//here we are configuring dist to serve app files
app.use(express.static('dist'))
app.use(bodyParser.json())

//authentication middleware
app.use('/database', async (req, res, next) => {
	await client.verifyIdToken({
		idToken: req.body.idtoken || req.query.idtoken,
		audience: '***REMOVED***',
	}).then((googleusercontent)=>{
		res.locals.userid = googleusercontent.payload.sub
		console.log("Authenticated "+res.locals.userid)
		next()
	}).catch((e)=>{
		res.send("Failed to authenticate")
		console.error(e)
	})
})

//database config
app.post('/database/user', async (req, res) => {
	console.log("updated or added username")
	await db.none('INSERT INTO users(userid, username) VALUES(${userid}, ${username}) ON CONFLICT (userid) DO UPDATE SET username = EXCLUDED.username', {userid: res.locals.userid, username: req.body.username})
	.then(()=>res.send({code: 0}))
	.catch(e=>{
		res.send(e)
		console.log(e)
	})
})
app.get('/database/user', async (req, res) => {
	console.log("retrieved username")
	await db.one('SELECT * FROM users WHERE userid = ${userid}', {userid: res.locals.userid})
	.then((result)=>{
		console.log(result)
		res.send(result)
	}).catch(e=>{
		res.send("Failed to retrieve username")
		console.error(e)
	})
})

// this * route is to serve project on different page routes except root `/`
app.get(/.*/, function (req, res) {
	res.sendFile(path.join(__dirname, '/dist/index.html'))
})

const port = process.env.PORT || 3000
app.listen(port)
console.log(`app is listening on port: ${port}`)
