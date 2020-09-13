const express = require('express')
var bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const {OAuth2Client} = require('google-auth-library')
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

//get database columns
const dbCols = ["username", "darkmode"]

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
	delete req.body.idtoken
	if (Object.keys(req.body).filter(k=>dbCols.includes(k)).length == 0){ //if no data is specified, try to initialize user
		console.log("Post with no data specified")
		await db.none('INSERT INTO users(userid) VALUES($(userid)) ON CONFLICT (userid) DO NOTHING', {
			userid: res.locals.userid
		}).then(()=>{
			res.send({code: 0})
		}).catch(e=>{
			res.send(e)
			console.error(e)
		})
		return
	}
	console.log("updated or added user")
	const valid = Object.keys(req.body).filter(key => dbCols.includes(key)).reduce((obj, key)=>{obj[key] = req.body[key]; return obj}, {})
	const params = Object.assign({userid: res.locals.userid}, valid)
	await db.none(`INSERT INTO users(${Object.keys(params).join(',')}) VALUES(${Object.keys(params).map(k=> '$('+ k + ')').join(',')}) ON CONFLICT (userid) DO UPDATE SET ${Object.keys(valid).map(k=> k + '=EXCLUDED.'+ k).join(',')}`, 
		params
	).then(()=>{
		res.send({code: 0})
	}).catch(e=>{
		res.send(e)
		console.log(e)
	})
})
app.get('/database/user', async (req, res) => {
	console.log("Retrieved user")
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