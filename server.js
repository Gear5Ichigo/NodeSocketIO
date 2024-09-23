const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io')
const { Strategy } = require('passport-local');
const fs = require('node:fs');

const app = express();
const server = createServer(app);
const io = new Server(server, {maxHttpBufferSize: 8e8});

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
    cb(null, {
      username: user.username,
      pfp: user.profile_picture,
      color: user.color,
    });
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
const sessionOptions = session({
  secret: 'tacocat backwards',
  resave: false,
  saveUninitialized: false,
});
function onlyForHandshake(middleware) {
  return (req, res, next) => {
    const isHandshake = req._query.sid === undefined;
    if (isHandshake) {
      middleware(req, res, next);
    } else {
      next();
    }
  };
}
app.use(express.urlencoded({extended: true}))
app.use(sessionOptions);
app.use(passport.authenticate('session'));
io.engine.use(sessionOptions)
io.engine.use(passport.authenticate('session'))
io.engine.use(
  onlyForHandshake((req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.writeHead(401);
      res.end();
    }
  }),
);

app.use('/users', users);
app.use('/rooms', rooms);
app.use('/assets', express.static(join(__dirname, '/assets')))
app.use('/uploads', express.static(join(__dirname, '/uploads')))
app.use('/icons', express.static(join(__dirname, '/icons')))

function loggedIn(req, res, next) { if (req.isAuthenticated()) { next() } else res.redirect('/users/signin'); }

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/dashboard', loggedIn, (req, res)=>{
  console.log(req.session)
  res.render('dashboard');
})

app.get('/allchat', loggedIn, (req, res)=>{
  res.render('allchat');
})

let allusers_allchat = []
let userstyping_allchat = []

io.on('connection', (socket) => {
  const req = socket.request

  console.log(req.user.username, socket.id);

  req.user.socketId = socket.id;
  allusers_allchat.push(req.user);
  io.emit('user connected', req.user, allusers_allchat);
  io.to(req.user.socketId).emit('client connect', req.user);

  socket.on('chat message', (msg, file, cb) => {
    if (file.name!=null) {
      file.name = req.user.username+"-"+file.name
      fs.readdir(join(__dirname, 'uploads/chat/'), (err, files) => {
        if (err) {
          console.log(err)
        } else {
          let iteration = 1
          if (files.includes(file.name)) {
            while (true) {
              if (!files.includes(file.name+` (${iteration})`)) {
                file.name=file.name+` (${iteration})`; break;
              }
              iteration++;
            }
          }
          fs.writeFileSync(join(__dirname, 'uploads/chat/'+file.name), file.data, (err)=>{
            cb({message: err ? 'failure' : 'success'});
          });
        }
      })
    }
    const atSymbol = msg.indexOf('@')
    const endOfName = msg.indexOf(' ', atSymbol) != -1 ? msg.indexOf(' ', atSymbol) : msg.length;
    const isUser = allusers_allchat.find(user => user.username == msg.substring(atSymbol+1, endOfName));
    const targetuser = isUser != undefined ? isUser : {username: '?'};
    console.log("USER_: "+targetuser.username);
    console.log(file);
    io.emit('chat message', msg, req.user, {name: targetuser.username}, {name: file.name, type: file.type});
  });

  socket.on('user typing', () => {
    if ( userstyping_allchat.indexOf(req.user) == -1 ) userstyping_allchat.push(req.user);
    io.emit('user typing', userstyping_allchat, req.user);
  });

  socket.on('user not typing', () => {
    if (userstyping_allchat.includes(req.user)) userstyping_allchat.splice(userstyping_allchat.indexOf(req.user), 1);
    io.emit('user typing', userstyping_allchat);
  })

  socket.on('disconnect', ()=>{
    allusers_allchat.splice(allusers_allchat.indexOf(req.user), 1);
    userstyping_allchat.splice(userstyping_allchat.indexOf(req.user), 1);
    io.emit('user left', req.user, allusers_allchat); socket.broadcast.emit('user typing', userstyping_allchat);
    console.log("disconnected");
  });
  
});

server.listen(8000, () => {
  console.log('server running at http://localhost:8000');
});