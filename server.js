const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io')
const { Strategy } = require('passport-local');

const app = express();
const server = createServer(app);
const io = new Server(server);

const users = require('./routes/users');
const rooms = require('./routes/rooms');

const { MongoClient } = require('mongodb');
const mongo_client = new MongoClient("mongodb+srv://nenreh:mongoneh@schoolstuff.gjla1uc.mongodb.net/?retryWrites=true&w=majority&appName=SchoolStuff");
const db = mongo_client.db("SocketIO");
const user_collection = db.collection("Users");

passport.use(new Strategy(async function verify(username, password, cb){
  const user_result = await user_collection.findOne( {username: username} );

  if (user_result!=null) {
    if (user_result.password===password) {
      cb(null, user_result);
    } else cb(null, false, {message: 'Incorrect password'});
  } else {
    cb(null, false, {message: 'User does not exist'});
  }
}));

passport.serializeUser((user, cb)=>{
  process.nextTick(()=>{
    cb(null, {username: user.username});
  })
});

passport.deserializeUser((user, cb)=>{
  process.nextTick(()=>{
    cb(null, user);
  })
});

app.set('views', [
  join(__dirname, 'views/users'), 
  join(__dirname, 'views'),
  join(__dirname, 'views/partials'),
  join(__dirname, 'views/site'),
]);
app.set('view engine', 'ejs')

app.use(express.urlencoded({extended: true}))
app.use(session({
  secret: 'tacocat backwards',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

app.use('/users', users);
app.use('/rooms', rooms);

function loggedIn(req, res, next) { if (req.isAuthenticated()) { next() } else res.redirect('/users/signin'); }

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/dashboard', loggedIn, (req, res)=>{
  console.log(req.session)
  res.render('dashboard');
})

app.get('/allchat', loggedIn, (req, res)=>{
  io.emit('get-session', req.session);
  res.render('allchat');
})

app.get('/users/destroy-session', (req, res)=>{
  req.session.destroy((err)=>{
    if (err) {
      res.send(err);
    } else res.redirect('/users/signin');
  })
});

io.on('connection', (socket) => {
  let session = null;

  io.emit('user connected')

  socket.on('get-session', (s)=>{
    console.log("WAAAAAAAAA");
    session = s;
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg, session);
  });

  socket.on('disconnect', ()=>{
    console.log("disconnected")
  });
  
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});