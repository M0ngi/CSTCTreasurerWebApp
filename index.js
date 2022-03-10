const { app } = require("./config");
const express = require("express");
const firestore = require('./firestore');
const cookieParser = require('cookie-parser');
const path = require('path');
const log = require('./log');
var requestIp = require('request-ip');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//username and password
const myusername = process.env.LOGIN_USER ?? "REDACTED"
const mypassword = process.env.LOGIN_PASS ?? "REDACTED"

let authToken = "";

app.get("/api/signout", (req, res) =>{
    req.session.destroy();
    res.json({code: 200, res: "Logged out"})
})

app.post("/api/authAdmin", (req, res) =>{
    if(req.session.userid){
        var clientIp = requestIp.getClientIp(req);
        log.logEvent(clientIp, "Signin", level=1);

        res.json({ code: 200 })
        return;
    }

    if(req.body.uname !== myusername || req.body.pass != mypassword){
        var clientIp = requestIp.getClientIp(req);
        log.logEvent(clientIp, "Signin", comment="Bad creds: " + req.body.uname + ":" + req.body.pass, level=2);

        res.json({ code: 498, error: "Bad request." })
        return;
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true')
    authToken = Array(125).fill(0).map(x => Math.random().toString(36).charAt(2)).join('');

    req.session.userid = myusername;
    req.session.token = authToken;

    res.json({ code: 200 });
    
    var clientIp = requestIp.getClientIp(req);
    log.logEvent(clientIp, "Signin", level=1);
});

app.get("/api/getUsers", async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true')

    if(!req.session.userid || !req.session || !req.session.token){
        var clientIp = requestIp.getClientIp(req);
        log.logEvent(clientIp, "Get users", level=2, comment="No session");

        res.json({code: 499, error: "Not authed"});
        return;
    }
    if(req.session.token !== authToken){
        var clientIp = requestIp.getClientIp(req);
        log.logEvent(clientIp, "Get users", level=2, comment="Invalid token");

        res.json({code: 498, error: "Not authed"});
        return;
    }

    let page = -1;
    if(req.query.page) page = parseInt(req.query.page, 10);

    try{
        res.json({ code: 200, res: await firestore.getUsers(page) });
        var clientIp = requestIp.getClientIp(req);
        log.logEvent(clientIp, "Get users", level=1);

    } catch(e){
        console.log(e);
        log.logEvent(clientIp, "Get users", comment=e, level=2);
        res.json({ code: 500, error: e});
    }
});

app.post("/api/changeUserStatus", async (req, res)=>{
    if(!req.session.userid || !req.session || !req.session.token){
        var clientIp = requestIp.getClientIp(req);
        log.logEvent(clientIp, "Change user status", level=2, comment="No session");

        res.json({code: 499, error: "Not authed"});
        return;
    }
    if(req.session.token !== authToken){
        var clientIp = requestIp.getClientIp(req);
        log.logEvent(clientIp, "Change user status", level=2, comment="Invalid token");

        res.json({code: 498, error: "Not authed"});
        return;
    }

    // curl "http://localhost:3001/api/changeUserStatus" -d "{\"test\": true}" -H "Content-Type: application/json"
    if(!req.body.uid || req.body.paid === undefined){
        var clientIp = requestIp.getClientIp(req);
        log.logEvent(clientIp, "Change user status", level=2, comment="Invalid parameters");

        return res.json({ code: 501, error: "Missing parameters"});
    }

    res.json( await firestore.updateUserPayment(req.body.uid, req.body.paid) );
    
    var clientIp = requestIp.getClientIp(req);
    log.logEvent(clientIp, "Change user status", level=2, comment="Change " + req.body.uid + " to " + (req.body.paid ? "paid" : "not paid"));
})

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    var clientIp = requestIp.getClientIp(req);
    log.logEvent(clientIp, "Page visit");
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
  });
  // --------------------------------