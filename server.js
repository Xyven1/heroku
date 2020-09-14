const express = require('express')
var bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const {OAuth2Client} = require('google-auth-library')
const e = require('express')
const client = new OAuth2Client('***REMOVED***')
const pgp = require('pg-promise')()
const db = pgp(process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/postgres')
const app = express()
//here we are configuring dist to serve app files
if(process.env.__DEV__){
	console.log("Running in developement environment")
	app.use(cors())	
}
app.use(express.static('dist'))
app.use(bodyParser.json())

//get database columns which user can edit
const dbCols = ["username", "darkmode"]

//authentication middleware
app.use('/database', async (req, res, next) => {
	await client.verifyIdToken({
		idToken: req.headers.authorization,
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
	delete req.body.idtoken
	const valid = Object.keys(req.body).filter(key => dbCols.includes(key))
	var query = valid.length>0
		? `UPDATE users SET ${valid.map(k=> k + '='+ '$(' + k + ')').join(',')} WHERE userid = $(userid)`
		: 'INSERT INTO users(userid) VALUES($(userid)) ON CONFLICT (userid) DO NOTHING'
	await db.none(query, 
		valid.reduce((obj, key)=>{obj[key] = req.body[key]; return obj}, {userid: res.locals.userid})
	).then(()=>{
		res.send({code: 0})
	}).catch(e=>{
		res.send(e)
		console.log(e)
	})
})
app.get('/database/user', async (req, res) => {
	console.log("Retrieved user")
	const query = req.query.username == null 
		? 'SELECT * FROM users WHERE userid = $(userid)'
		: 'SELECT * FROM users WHERE username = $(username)'
	await db.one(query, {userid: res.locals.userid, username: req.query.username}).then((result)=>{
		console.log(result)
		res.send(result)
	}).catch(e=>{
		res.send("Failed to retrieve username")
		console.error(e)
	})
})
app.get('/database/users', async (req, res) =>{
	console.log(req.query)
	const query = `SELECT username, money, rank FROM 
									(SELECT username, money, created, RANK() OVER (ORDER BY money DESC, created) as rank FROM users) as rankedUser
									${req.query.search == null ? "LIMIT 500" : "WHERE username ILIKE $(search) || '%'" }`
	if(req.query.search == '')
		return res.send([])
	await db.any(query, {search: req.query.search}).then(result=>{
		res.send(result.map(e => ({rank: e.rank,username: e.username, money: '$' + Number.parseFloat(e.money).toFixed(2)})))
	}).catch(e=>{
		res.send("Failed to retrieve user")
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