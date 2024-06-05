const express = require("express");
const { join } = require("node:path")
const router = express.Router();

const { MongoClient } = require('mongodb');
const mongo_client = new MongoClient("mongodb+srv://nenreh:mongoneh@schoolstuff.gjla1uc.mongodb.net/?retryWrites=true&w=majority&appName=SchoolStuff");
const db = mongo_client.db("SocketIO");
const users = db.collection("Users");

router.get('/', (req, res)=>{
    res.send("sup")
});

router.get('/new', (req, res)=>{
    res.render("JOE NIDEM")
});

module.exports = router;