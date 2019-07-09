// Import express and request modules
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var fs = require('fs');
var run = require('./run');
var slack = require('./slackControl')

// Instantiates Express and assigns our app variable to it
var app = express();
var urlencodedParser = bodyParser.urlencoded({extended:false});

// Store our app's ID and Secret. These we got from Step 1. 
// For this tutorial, we'll keep your API credentials right here. But for an actual app, you'll want to  store them securely in environment variables. 
var clientId = '6147421574.616289530801';
var clientSecret = '48fcb6b2a912217d75bb8c801ba3261f';

// Again, we define a port we want to listen to
const PORT=3000;
const publicAddress = 'http://76dd2731.ngrok.io';

// Lets start our server
app.listen(PORT, function () {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Example app listening on port " + PORT);
});

app.use('/', express.static('html/public'));

// This route handles GET requests to our root ngrok address and responds with the same "Ngrok is working message" we used before
/*app.get('/', function(req, res) {
    res.sendFile('./html/index.html');
    console.log(res.json);
});*/

// This route handles get request to a /oauth endpoint. We'll use this endpoint for handling the logic of the Slack oAuth process behind our app.
app.get('/oauth', function(req, res) {
    // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that code is not there, we respond with an error message
    if (!req.query.code) {
        res.status(500);
        res.send({"Error": "Looks like we're not getting code."});
        console.log("Looks like we're not getting code.");
    } else {
        // If it's there...
        // We'll do a GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret, and the code we just got as query parameters.
        request({
            url: 'https://slack.com/api/oauth.access', //URL to hit
            qs: {code: req.query.code, client_id: clientId, client_secret: clientSecret}, //Query string data
            method: 'GET', //Specify the method

        }, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                res.json(body);
            }
        })
    }
});

app.post('/loadjson', function(req, res){
    fs.readFile('./defaultSettings.json', 'utf8', function(err, data){
        res.send(JSON.stringify(data));
        console.log(data);
    });
});
// Route the endpoint that our slash command will point to and send back a simple response to indicate that ngrok is working
app.post('/command', urlencodedParser, function(req, res) {
    
    var reqBody = req.body;
    var responseURL = reqBody.response_url;
    text = reqBody.text;
    console.log(text);
    if(fs.existsSync(text)){
        //sends the file path to the run.js script to start encoding
        res.send('Encoding is about to start :)')
        run.recieveSlackInput(text);
    }else if(text == 'settings'){
        //this will send the settings attachment to the slack channel
        slack.settingsMessage(publicAddress);
    }else{
        res.send('Not a valid command try: /encode settings or /encode C:/your/file/path ')
    }
});