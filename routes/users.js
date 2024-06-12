const express = require("express");
const passport = require('passport')

const router = express.Router();

router.get('/', (req, res)=>{
    res.redirect('users/signin');
});

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