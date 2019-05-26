var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;
var kafka = require('kafka-node');

var chatCache = {};
var chatCacheMaxSize = 100;
var groupId = 'node-1';
var topicName = 'chatMessages';

var producer = new kafka.Producer(new kafka.KafkaClient());
var consumer = new kafka.Consumer(new kafka.KafkaClient(),
                                  [ { topic: topicName, partition: 0 } ]
                                  { autoCommit: true, groupId: groupId });
consumer.on('message', messages => {
  console.log(messages);
  if (!chatCache[chat]) {
    chatCache[chat] = [];
  }
  messages.forEach(message => {
    chatCache[chat].push(message);
    if (chatCache[chat].length > chatCacheMaxSize) {
      chatCache[chat].shift();
    }
  });
  emitMessages(chat, messages);
});

app.use(bodyParser.json());

app.use(express.static(__dirname + '/static'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/node_modules',  express.static(__dirname + '/node_modules'));

app.put('/api/chat/:chat/message', (req, res, next) => {
  let chat = req.params.chat;
  if (req.body.messages) {
    producer.send({ topic: topicName, messages: req.body.messages }, () => console.log(`Succesfully produced ${req.body.messages}`));
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

function emitMessages(chat, messages) {
  io.emit(`chatMessage_${chat}`, messages);
}

http.listen(port, () => console.log(`Chattable app is listening to port ${port}!`));
