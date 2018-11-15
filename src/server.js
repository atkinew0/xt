var terminals = {}, logs = {};

//const PORT = require('./config').PORT;
const express = require('express');
const app = express();
const pty = require('node-pty');
const argv = require('yargs').argv;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const keys = require('../config/keys.js');
//const question = require('../models/level');
const cors = require('cors');
const { Schema } = mongoose;

const port = argv.port || 3001;
const host = '127.0.0.1';
const ALLOWED_ORIGINS = [
  '0.0.0.0',
  '127.0.0.1',
  'home.localhost',
  'chrome-extension://'
];

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const questionSchema = new Schema({
      id:{
        type:Number,
        required:true
      },
      prompt:{
        type:String,
        required:true
      },
      answer:{
        type:String,
        required:true
      },
      answered:{
        type:Boolean,
        required:true
      },
      level:{
        type:Number,
        required:true
      }
});

const Question = mongoose.model('levels',questionSchema);

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');

  let origin = req.get('origin');
  let host = req.get('host');
  let foundOrigin = ALLOWED_ORIGINS.find(o => (origin && origin.indexOf(o) >= 0));
  let foundHost = ALLOWED_ORIGINS.find(h => (host && host.indexOf(h) >= 0));

  if (!foundOrigin && !foundHost) {
    res.status(403);
    res.send('Go away!');
    res.end();
    return;
  }
  next();
});
app.use('/', express.static(__dirname + '/../build'));

mongoose.connect(keys.mongoCredentials);

require('express-ws')(app);


app.get("/api/level/:levelnum", function(req,res) {
  const levelnum = parseInt(req.params.levelnum);

  console.log("/api/level/:level get route hit level",levelnum);


  Question.find({level:levelnum}, function(err, questions){
    if(err) console.log("Mongo error",err);
    console.log(questions);
    res.send(questions);
    //here want to send back the questions as json to the react component that fetched it
  });
  
});

app.post("/api/level/:levelnum", function(req,res) {
  const levelNum = parseInt(req.params.levelnum);
  console.log("Hit post for q");
  console.log(req.body);

  let nextId = 0;
  
  //always get current highest question id for that level in the DB so we can add next id
Question.find({level:levelNum}).sort('-id').exec(function(err, document){
  console.log("Found the latest id doc ",document);
  nextId = document[0].id +1;
  console.log("Next id is",nextId);

  Question.create(
        {
          id: nextId,
          prompt:req.body.prompt,
          answer:req.body.answer,
          answered:false,
          level:req.body.level
        }
      ).then(question => {
        res.json(question);
      });
  
});

  // Question.find({level:levelNum})
  // .sort('id')
  // .exec( function(err, member){
  //   if(err) console.log(err);
  //   console.log("Got members",member);

  //   nextId =  member.id;
  //   console.log("Next id is",nextId);

  //   Question.create(
  //     {
  //       id: nextId,
  //       prompt:req.body.prompt,
  //       answer:req.body.answer,
  //       answered:false,
  //       level:req.body.level
  //     }
  //   ).then(question => {
  //     res.json(question);
  //   });


  // })

  

});

app.post('/terminals', function (req, res) {
  let shell = argv.shell && argv.shell !== '' ? argv.shell : process.platform === 'win32' ? 'cmd.exe' : 'bash';
  let cols = parseInt(req.query.cols, 10);
  let rows = parseInt(req.query.rows, 10);
  let term = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: cols || 80,
    rows: rows || 24,
    cwd: process.env.PWD,
    env: process.env
  });

  console.log('Created terminal with PID: ' + term.pid);
  terminals[term.pid] = term;
  logs[term.pid] = '';
  term.on('data', function (data) {
    logs[term.pid] += data;
  });
  res.send(term.pid.toString());
  res.end();
});

app.post('/terminals/:pid/size', function (req, res) {
  let pid = parseInt(req.params.pid, 10);
  let cols = parseInt(req.query.cols, 10);
  let rows = parseInt(req.query.rows, 10);
  let term = terminals[pid];

  term.resize(cols, rows);
  console.log('Resized terminal ' + pid + ' to ' + cols + ' cols and ' + rows + ' rows.');
  res.end();
});

app.ws('/terminals/:pid', function (ws, req) {

  var term = terminals[parseInt(req.params.pid, 10)];

  if (!term) {
    ws.send('No such terminal created.');
    return;
  }

  console.log('Connected to terminal ' + term.pid);
  ws.send(logs[term.pid]);

  term.on('data', function (data) {
    console.log('Incoming data = ' + data);
    try {
      ws.send(data);
    } catch (ex) {
      // The WebSocket is not open, ignore
    }
  });
  ws.on('message', function (msg) {
    
    term.write(msg);
  });
  ws.on('close', function () {
    term.kill();
    console.log('Closed terminal ' + term.pid);
    // Clean things up
    delete terminals[term.pid];
    delete logs[term.pid];
  });
});

if (!port) {
  console.error('Please provide a port: node ./src/server.js --port=XXXX');
  process.exit(1);
} else {
  app.listen(port, host);
  console.log('Evala server listening at http://' + host + ':' + port);
}