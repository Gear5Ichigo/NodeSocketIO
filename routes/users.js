const express = require("express");
const passport = require('passport')

const { MongoClient } = require('mongodb');
const { redirect } = require("express/lib/response");
const res = require("express/lib/response");
const mongo_client = new MongoClient("mongodb+srv://nenreh:mongoneh@schoolstuff.gjla1uc.mongodb.net/?retryWrites=true&w=majority&appName=SchoolStuff");
const db = mongo_client.db("SocketIO");
const users = db.collection("Users");

const router = express.Router();

router.get('/', (req, res)=>{
    res.redirect('users/signin');
});

router.get('/profile', (req, res)=>{
    if (req.isAuthenticated()) {
        res.render('profile', {use_color: req.session.passport.user.color});
    } else res.redirect('/users/signin');
})

router.get('/signin', (req, res)=>{
    res.render('sign_in', {name:"JOE"})
});

router.post('/enter', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/signin',
}));

router.get('/create', (req, res)=>{
    res.render('create', {alert: ''})
});

router.post('/update', async (req, res)=>{
    const user = await users.findOne({username: req.session.passport.user.username});
    if (user!=null) {
        users.updateOne({
            username: user.username,
            password: user.password,
        }, {$set: {color: req.body.color}});
        req.session.passport.user.color = req.body.color
        res.redirect('/users/profile');
    } else res.send('Error');
});

router.post('/logout', (req, res)=>{
    req.logout((err)=>{
        if (err) {
            res.send(err);
        } else redirect('/users/signin');
    })
})

router.post('/register', async (req, res)=>{

    console.log( req.body );

    const result = await users.findOne( {username: req.body.username} )
    if (result==null) {
        users.insertOne({
            username: req.body.username,
            password: req.body.password,
            color: '#000000',
        });
    } else {
        res.redirect('/users/create?registerfail=true');
        return
    }

    res.redirect('/users');
})

module.exports = router;