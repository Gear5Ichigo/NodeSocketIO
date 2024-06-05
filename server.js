const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io')

const app = express();
const server = createServer(app);
const io = new Server(server);
const users = require('./routes/users');

app.use('/users', users);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'views/index.html'))
});

io.on('connection', (socket) => {

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', ()=>{console.log("disconnected")})
  
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});