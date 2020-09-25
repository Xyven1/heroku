import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import bodyParser from 'body-parser' 
import compression from 'compression'
import googleAuth from 'google-auth-library'
import pgPromise from 'pg-promise'
import Listener from 'pg-promise-listener'
import http from 'http'
import socketIO from 'socket.io'

const app = express()

const pgp = pgPromise({})
const db = pgp(process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/postgres')

const {OAuth2Client} = googleAuth
const client = new OAuth2Client(process.env.clientid)

const server = http.createServer(app);
const io = socketIO(server)

//code dependant on node environment
if(process.env.NODE_ENV === 'production') {
	console.log("Running in production en")
	app.use((req, res, next) => {
		if (req.header('x-forwarded-proto') !== 'https')
			res.redirect(`https://${req.header('host')}${req.url}`)
		else
			next()
	})
}else {
	console.log("Running in developement environment")
	app.use(cors())	
}

//configuring dist to \serve app files
app.use(compression())
app.use(express.static('dist'))
app.use(bodyParser.json())

// this * route is to serve project on different page routes except root `/`
app.get(/.*/, function (req, res) {
	res.sendFile(path.join(path.dirname(fileURLToPath(import.meta.url)), '/dist/index.html'))
})

//web socket
var clients = [] //client cache
var listeners = [] //database listeners
const dbCols = ["username", "darkmode"] //columns users are allowed to modify
io.on('connect', (socket)=>{
	var cli = {
		sessionID: socket.id, 
		ip: socket.handshake.headers["x-forwarded-for"] || socket.conn.remoteAddress.split(":")[3] || null,
		user: null
	}
	clients.push(cli)
	console.log("Connected new user:", cli.sessionID)
	//client managment
	socket.on('login', async (data, callback = () => {}) =>{ 
		await client.verifyIdToken({
			idToken: data,
			audience: process.env.clientid,
		}).then(async (googleusercontent)=>{
			cli.user = {}
			cli.user.googleid = googleusercontent.payload.sub
			await db.none('INSERT INTO users(googleid) VALUES($(googleid)) ON CONFLICT (googleid) DO NOTHING', {googleid: cli.user.googleid}).catch(()=>{})
			await db.one('SELECT * FROM users WHERE googleid = $(googleid)', {googleid: cli.user.googleid}).then((res)=>{
				callback({ ok: true, data: res})
				cli.user = res
				socket.emit('loggedIn')
				socket.broadcast.emit('userLoggedIn', res.username)
			}).catch(()=>{})
		}).catch((e)=>{
			console.error("Failed to login user", e)
			callback({ok: false})
		})
	})
	socket.on('logout', () =>{
		console.log("attempted to log out: " + socket.id)
		cli.user = null
	})
	socket.on('disconnect', ()=>{
		console.log("disconnected: " + socket.id)
		clients.pop(cli)
	})
	//databse interaction
	socket.on('checkUsername', async (data, callback = ()=>{}) => {
		await db.oneOrNone('SELECT 1 FROM users WHERE username ~~* $(username)', 
			{username: data}
		).then((res)=>{
			callback({taken: !!res})
		}).catch(e=>{
			callback({code: e.code})
		})	
	})
	socket.on('getUser', async (data, callback = ()=>{}) => {
		if(cli.user == null) return callback({msg:'failed to authenticate'})
		const query = data == null 
			? 'SELECT * FROM users WHERE googleid = $(googleid)'
			: 'SELECT * FROM users WHERE username = $(username)'
		await db.one(query, {googleid: cli.googleid, username: data}).then((result)=>{
			callback({data: result})
		}).catch(e=>{
			callback({error: "Failed to retrieve user"})
			console.error(e)
		})
	})
	socket.on('updateUser', async (data, callback = ()=>{}) => {
		if(cli.user == null) return callback({msg:'failed to authenticate'})
		const valid = Object.keys(data ?? {}).filter(key => dbCols.includes(key))
		if(valid.length < 1) return callback({msg:'Must specify properties to update'})
		await db.none(`UPDATE users SET ${valid.map(k=> k + '='+ '$(' + k + ')').join(',')} WHERE googleid = $(googleid)`, 
			valid.reduce((obj, key)=>{obj[key] = data[key]; return obj}, {googleid: cli.user.googleid})
		).then(()=>{
			callback({ok: true})
		}).catch(e=>{
			callback({code: e.code})
			console.error(e)
		})
	})
	socket.on('getUsers', async (data, callback = ()=>{}) => {
		const query = `SELECT username, money, rank FROM 
										(SELECT username, money, created, RANK() OVER (ORDER BY money DESC, created) as rank FROM users) as rankedUser
										${data == null ? "LIMIT 500" : "WHERE username ILIKE $(search) || '%' LIMIT 50"}`
		await db.any(query, {search: data}).then(result=>{
			callback(result.map(e => ({userid: e.userid, rank: e.rank, username: e.username, money: e.money})))
		}).catch(e=>{
			callback("Failed to retrieve users")
			console.error(e)
		})
	})
	//chat feature
	socket.on('sendMessage', (message) => {
		if(cli.user == null) return
		console.log(cli.user)
		socket.broadcast.emit('chat', {
			message: message, 
			user: {
				username: cli.user.username,
				userid: cli.user.userid,
				money: cli.user.money,
				created: cli.user.created
			}, 
			timestamp: Date.now()
		})
	})
	socket.on('joinedChat', () => {
		if(cli.user == null) return
		socket.broadcast.emit('chat', {join: true, user: {
			username: cli.user.username,
			userid: cli.user.userid,
			money: cli.user.money,
			created: cli.user.created}
		})
	})
	socket.on('leftChat', () => {
		if(cli.user == null) return 
		socket.broadcast.emit('chat', {leave: true, user: {
			username: cli.user.username,
			userid: cli.user.userid,
			money: cli.user.money,
			created: cli.user.created}
		})
	})
})
//listeners for pg database
listeners.push(new Listener({
	dbConnection: db,
	parseJson: true,
	channel: 'updatedprivate',
	onDatabaseNotification: data => {
		clients.forEach(cli=>{
			if(cli.user?.googleid == data.googleid)
				io.to(cli.sessionID).emit('updatedprivate', data)
		})
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

setInterval(async ()=>{
	await db.none('UPDATE users SET money = money+1000').catch(()=>{})
}, 3600000)