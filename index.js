var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

let chatCache = {};
let chatCacheMaxSize = 100;

app.use(bodyParser.json());

app.use(express.static(__dirname + '/static'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/node_modules',  express.static(__dirname + '/node_modules'));

app.put('/api/chat/:chat/message', (req, res, next) => {
  let chat = req.params.chat;
  if (req.body.messages) {
    if (!chatCache[chat]) {
      chatCache[chat] = [];
    }
    req.body.messages.forEach(message => {
      chatCache[chat].push(message);
      if (chatCache[chat].length > chatCacheMaxSize) {
        chatCache[chat].shift();
      }
    });
    io.emit(`chatMessage_${chat}`, req.body.messages);
  }
  res.sendStatus(200);
});

app.get('/api/chat/:chat/message', (req, res, next) => {
  let chat = req.params.chat;
  res.json({ messages: chatCache[chat] });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
});

http.listen(port, () => console.log(`Chattable app is listening to port ${port}!`));
