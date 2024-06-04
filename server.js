const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io')
const { MongoClient } = require('mongodb');

const app = express();
const server = createServer(app);
const mongo_client = new MongoClient("mongodb+srv://nenreh:mongoneh@schoolstuff.gjla1uc.mongodb.net/?retryWrites=true&w=majority&appName=SchoolStuff");
const io = new Server(server);

mongo_client.connect();

const db = mongo_client.db("SocketIO");

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'site/index.html'))
});

io.on('connection', (socket) => {

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});