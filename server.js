const express = require('express')
const app = express()
//utilities
const cors = require('cors')
const path = require('path')
const bodyParser = require('body-parser')
//google authentication
const {OAuth2Client} = require('google-auth-library')
const client = new OAuth2Client('***REMOVED***')
//databse
const pgp = require('pg-promise')()
const db = pgp(process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/postgres')
const Listener = require('pg-promise-listener');

//code for development
if(process.env.__DEV__){
	console.log("Running in developement environment")
	app.use(cors())	
}

//configuring dist to serve app files
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
		res.locals.googleid = googleusercontent.payload.sub
		console.log("Authenticated "+res.locals.googleid)
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
		? `UPDATE users SET ${valid.map(k=> k + '='+ '$(' + k + ')').join(',')} WHERE googleid = $(googleid)`
		: 'INSERT INTO users(googleid) VALUES($(googleid)) ON CONFLICT (googleid) DO NOTHING'
	await db.none(query, 
		valid.reduce((obj, key)=>{obj[key] = req.body[key]; return obj}, {googleid: res.locals.googleid})
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
		? 'SELECT * FROM users WHERE googleid = $(googleid)'
		: 'SELECT * FROM users WHERE username = $(username)'
	await db.one(query, {googleid: res.locals.googleid, username: req.query.username}).then((result)=>{
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
									${req.query.search == null ? "LIMIT 500" : "WHERE username ILIKE $(search) || '%' LIMIT 50"}`
	if(req.query.search == '')
		return res.send([])
	await db.any(query, {search: req.query.search}).then(result=>{
		res.send(result.map(e => ({userid: e.userid, rank: e.rank, username: e.username, money: '$' + Number.parseFloat(e.money).toFixed(2)})))
	}).catch(e=>{
		res.send("Failed to retrieve user")
		console.error(e)
	})
})

// this * route is to serve project on different page routes except root `/`
app.get(/.*/, function (req, res) {
	res.sendFile(path.join(__dirname, '/dist/index.html'))
})

//web socket
const server = require('http').createServer(app);
const io = require('socket.io')(server)
var clients = []
io.on('connection', (socket)=>{
	console.log("connected")
	socket.on('login', async (data) =>{ //user caching
		await client.verifyIdToken({
			idToken: data,
			audience: '***REMOVED***',
		}).then((googleusercontent)=>{
			var clientIndex = clients.findIndex(c=> c.googleid == googleusercontent.payload.sub)
			if(clientIndex < 0)
				clients.push({sessionID: socket.id, googleid: googleusercontent.payload.sub})
			else
				clients[clientIndex].sessionID = socket.id
			console.log('clients', clients)
		}).catch((e)=>{
			console.error("Failed to log user in (socket)", e)
		})
	})
})
io.on('disconnection', ()=>{console.log("disconnect")})
var listeners = []
listeners.push(new Listener({
	dbConnection: db,
	parseJson: true,
	channel: 'updatedprivate',
	onDatabaseNotification: data => {
		var cli = clients.find(c=> c.googleid == data.googleid)
		if(cli)
			io.to(cli.sessionID).emit('updatedprivate', data)
	}
}))
listeners.push(new Listener({
	dbConnection: db,
	channel: 'updatedpublic',
	onDatabaseNotification: () => io.emit('updatedpublic')
}))
		
const port = process.env.PORT || 3000
server.listen(port, () =>{
	console.log(`app is listening on port: ${port}`)
})