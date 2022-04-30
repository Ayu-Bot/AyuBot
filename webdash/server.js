 var express = require('express')
	, session = require('express-session')
	, router = express.Router()
	, app = express()
	, passport = require('passport')
	, Strategy = require('passport-discord').Strategy
	, refresh = require('passport-oauth2-refresh');
const db = require('../db.js')
const { Client, Collection, Intents } = require('discord.js');
const bodyParser = require('body-parser')
const flash = require('connect-flash');
const cors = require('cors')
var http = require('http').createServer(app);
var io = require('socket.io')(http);
//var cors = require('cors')
module.exports.io = io;
// const { token } = require('./config/config');

const client = require('../index.js')
const listen = client.listen;
http.listen(3000)
console.log(listen)
const hcaptcha = require('express-hcaptcha');
const crypto = require('crypto');
require('./socket.io.js')(io, client, db);
//client.login(process.env.token)
client.on("ready", () => {

	console.log("[Web Bot] Online")
})
app.use(function(req, res, next) {
	req.client = client;
	req.db = db;
	req.io = io;
	req.crypto = crypto;
	next();

})
app.use(cors());
app.use(flash());
//app.use(require('flash')());
app.use(express.static("webdash/public"))
app.set('views', __dirname + "/views")
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Oauth2
passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

var scopes = ['identify', 'guilds'];
var prompt = 'conset';

var dcstrat = new Strategy({
	clientID: process.env.id,
	clientSecret: process.env.secret,
	callbackURL: process.env.url,
	scope: scopes,
	prompt: prompt
}, function(accessToken, refreshToken, profile, done) {
	profile.accessToken = accessToken;
	profile.refreshToken = refreshToken;
	process.nextTick(function() {
		return done(null, profile);
	});
});

passport.use(dcstrat);
refresh.use(dcstrat);

/*
cookie: {
				maxAge: 60000 * 60 * 24
						},
}
*/
const MongoStore = require('connect-mongo');

app.use(session({
	secret: process.env.secretCookie,
	resave: true,
	cookie: {
		maxAge: 60000 * 60 * 24
	},
	saveUninitialized: false,
	store: MongoStore.create({
    mongoUrl: process.env.db
  })
}));
app.use(passport.initialize());
app.use(passport.session());
// Router
/*app.get("*", isAuth, (req,res) => {
	if(!req.user.id !== "407859300527243275") return res.redirect("/auth/callback");
	
	next()
})*/
var subdomains = require('express-subdomain')
app.use(subdomains('api', require("./route/dashboard.js")));

app.use("/", checkSession, require('./route/home.js'));
app.use("/dashboard", isAuth, require('./route/dashboard.js'));
app.use("/settings", isAuth, require('./route/settings.js'))
app.use("/auth", require('./route/lib/authRouter.js'));
app.use("/delivery", checkSession, require('./route/delivery.js'))

// app.use(require('express-spa-router')(app, {ignore: ["/dashboard", "/settings", "/"]}))

app.use(function(req, res) {
	res.status(404)
	res.render("lib/errors/404.ejs", {
		req, res, user: req.user, cli: req.client, message: ""
	})
})
app.use(function(req, res) {
	res.status(500)
	res.render("lib/errors/500.ejs", {
		req, res, user: req.user, cli: req.client
	})
})
function checkSession(req, res, next) {
	req.session.redirectUrl = req.originalUrl;
	next();
}

function isAuth(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.session.reqUrl = req.originalUrl; //Create session value with requested url
	res.redirect('/auth/login');
}
//app.listen(3000);
//require mongodb
