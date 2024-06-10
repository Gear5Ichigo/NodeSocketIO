const express = require("express");

const router = express.Router();

const { MongoClient } = require('mongodb');
const mongo_client = new MongoClient("mongodb+srv://nenreh:mongoneh@schoolstuff.gjla1uc.mongodb.net/?retryWrites=true&w=majority&appName=SchoolStuff");
const db = mongo_client.db("SocketIO");
const users = db.collection("Users");

router.get('/', (req, res)=>{
    res.redirect('users/signin');
});

router.get('/signin', (req, res)=>{
    res.render('sign_in', {name:"JOE"})
});

router.get('/create', (req, res)=>{
    res.render('create')
});

router.post('/submit', (req, res)=>{

    console.log( req.body );

    users.insertOne({
        Email: req.body.email,
        Username: req.body.username,
        Password: req.body.password,
    });

    console.log(users.findOne({username: req.body.username}));

    res.redirect('/users');
})

module.exports = router;