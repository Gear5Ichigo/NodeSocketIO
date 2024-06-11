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

router.post('/enter', async (req, res)=>{
    
    const user_result = await users.findOne( {username: req.body.username} );

    if (user_result!=null) {
        console.log(user_result);

        if (user_result.password===req.body.password) {
            if (req.session.loggedIn==null) {
                req.session.name = user_result.username;
                req.session.loggedIn = true;
                res.redirect('/dashboard?fromsignin=true');
            } else res.redirect('/users/signin?in-session-fail=true')
        } else res.redirect('/users/signin?loginfail=true');
    } else {
        res.redirect('/users/signin?namefail=true');
        console.log('fail ._.XD'+user_result);
    }

});

router.get('/create', (req, res)=>{
    res.render('create', {alert: ''})
});

router.post('/register', async (req, res)=>{

    console.log( req.body );

    const result = await users.findOne( {username: req.body.username} )
    if (result==null) {
        users.insertOne({
            username: req.body.username,
            password: req.body.password,
        });
    } else {
        res.redirect('/users/create?registerfail=true');
        return
    }

    res.redirect('/users');
})

module.exports = router;