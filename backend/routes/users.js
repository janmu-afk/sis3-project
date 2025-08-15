const express = require("express")
const crypto = require('crypto')
const users = express.Router();
const DB = require('../db/dbConn.js')

// no need to do async, crypto lib is synchronous
function hashPassword(password, salt) {
  return crypto
    .createHash('sha256')
    .update(salt + password)
    .digest('hex');
}

// compare two hashes
function timingSafeEq(aHex, bHex) {
  const a = Buffer.from(aHex, 'hex');
  const b = Buffer.from(bHex, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}


users.get('/session', async (req, res, next)=>{
    try{
        console.log("session data: ")
        console.log(req.session)
        res.json(req.session);
    }
    catch(err){
        console.log(err)
        res.sendStatus(500)
        next()
    }
 })

// POST /user/register: username, password, email
users.post('/register', async (req, res) => {
    var username = req.body.username;
    var email = req.body.email;

    // okay security practices :)
    const salt = crypto.randomBytes(16).toString('hex');
    var hash = hashPassword(req.body.password, salt);
    const password = `${salt}:${hash}`;

    try {
        var queryResult = await DB.registerUser(username, password, email);
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

//Checks if user submitted both fields, if user exist and if the combination of user and password matches
// POST /user/login: username, password, email
users.post('/login', async (req, res) => {

    var username = req.body.username;
    var password = req.body.password;
    var queryPassword = "";

    if (username && password) {
    // try to get the user's password from the db
        try {
            queryPassword = await DB.getPassword(username);
        } catch (err) {
            console.log(err)
            res.json({status:{success: false, msg: err}})
            res.status(200)
        }

        // hash check
        const [salt, hash] = (queryPassword[0].geslo).split(':');
        const ok = timingSafeEq(hashPassword(password, salt), hash);

        if (ok) {
            console.log("LOGIN OK");
            req.session.logged_in = true;
            req.session.username = username;
            try { email = await DB.getEmail(username); req.session.email = email[0].enaslov} catch (e) { console.log(e) }
            res.json({ success: true, message: "LOGIN OK" });
            res.status(200)
        }
        else {
            console.log("INCORRECT PASSWORD");
            res.json({ success: false, message: "INCORRECT PASSWORD" });
            res.status(200)
        }
    }
    else {
        console.log("Please enter Username and Password!")
        res.json({ success: false, message: "Please enter Username and Password!" });
        res.status(204)
    }
    res.end();
});


users.get('/logout', async (req,res, next)=>{
   try{
       req.session.destroy(function(err) {
           res.json({status:{success: true, msg: err}})
       })
      
   }
   catch(err){
       console.log(err)
       res.json({status:{success: false, msg: err}})
       res.sendStatus(500)
       next()
   }
})

users.get('/bookmarks', async (req,res, next)=>{
    if (req.session.logged_in) {
        try {
            let bookmarks = await DB.listUserBookmarks(req.session.username);
            res.json(bookmarks);
        } catch(err) {
            console.log(err)
        }
    }
})

users.post('/bookmarks', async (req,res, next)=>{
    if (req.session.logged_in) {
        try {
            let bookmarks = await DB.postBookmark(req.session.username);
            res.json(bookmarks);
        } catch(err) {
            console.log(err)
        }
    }
})

module.exports = users;
