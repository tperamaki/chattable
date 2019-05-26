var username = "New user";
var socket = io();
var chat;

function Chat(chatroom) {
  let that = this;
  this.chatroom = chatroom;
  document.getElementById('chatroom-title').innerHTML = chatroom;

  this.newChatroomForm = document.getElementById('new-chatroom-form');
  this.newChatroomInput = document.getElementById('new-chatroom-input');
  this.newMessageForm = document.getElementById('new-message-form');
  this.newMessageInput = document.getElementById('new-message-input');
  this.usernameForm = document.getElementById('username-form');
  this.usernameInput = document.getElementById('username-input');
  this.messageListContainer = document.getElementById('message-list-container');
  $('#message-list').empty();

  this.newMessageInput.focus();

  if (socket) {
    socket.disconnect();
    socket = io();
  }
  $.getJSON(`/api/chat/${this.chatroom}/message`, function(data) {
    if (data.messages) {
      $.each(data.messages, (i, message) => that.appendReceivedMessageToChatList(message));
    }
  });
  socket.on(`chatMessage_${chatroom}`, messages => messages.forEach(msg => this.appendReceivedMessageToChatList(msg)));
};

window.onload = function() {
  // Make sure we are always in a chatroom, as other parts of the app expects that
  chat = new Chat("General");
  chat.postMessage(`${username} joined!`);

  $('#new-chatroom-form').on('submit', joinNewRoom);
  $('#username-form').on('submit', setUsernameButtonClicked);
  $('#new-message-form').on('submit', submitMessageButtonClicked);
};

function setUsername(name) {
  username = name;
};

function joinNewRoom(e) {
  e.preventDefault();
  if (chat.newChatroomInput.value) {
    chat = new Chat(chat.newChatroomInput.value);
    chat.postMessage(`${username} joined!`);
    chat.clearInputAndFocusOnChatInput(chat.newChatroomInput);
  }
};

function setUsernameButtonClicked(e) {
  e.preventDefault();
  if (chat.usernameInput.value) {
    chat.postMessage(`${username} changed name to ${chat.usernameInput.value}`);
    setUsername(chat.usernameInput.value);
    chat.clearInputAndFocusOnChatInput(chat.usernameInput);
    chat.usernameInput.placeholder = username;
  }
};

function submitMessageButtonClicked(e) {
  e.preventDefault();
  if (chat.newMessageInput.value) {
    chat.postMessage(`${username}: ${chat.newMessageInput.value}`);
    chat.clearInputAndFocusOnChatInput(chat.newMessageInput);
  }
};

Chat.prototype.clearInputAndFocusOnChatInput = function(inputField) {
    inputField.value = '';
    this.newMessageInput.focus();
};

Chat.prototype.appendReceivedMessageToChatList = function(message) {
  $("#message-list").append(`<li>${message}</li>`);
  this.messageListContainer.scrollTop = this.messageListContainer.scrollHeight;
};

Chat.prototype.postMessage = function(message) {
  $.ajax({
    type: "PUT",
    url: `/api/chat/${this.chatroom}/message`,
    data: JSON.stringify({ messages: [ message ] }),
    contentType: "application/json; charset=utf-8",
    dataType: "json"
  });
};
