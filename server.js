const express = require('express');
const session = require('express-session');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io')

const app = express();
const server = createServer(app);
let io = new Server(server);
const users = require('./routes/users');

app.set('views', [
  join(__dirname, 'views/users'), 
  join(__dirname, 'views'),
  join(__dirname, 'views/partials'),
  join(__dirname, 'views/site'),
]);
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret:'tacocat backwards',
    resave: false,
    saveUninitialized: false,
}));
app.use('/users', users);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/dashboard', (req, res)=>{
  if (req.session.loggedIn) {
    console.log(req.session)
    res.render('dashboard');
  } else res.redirect('/users/signin');
})

app.get('/allchat', (req, res)=>{
  if (req.session.loggedIn) {
    io.emit('get-session', req.session);
    res.render('allchat');
  } else res.redirect('/users/signin');
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