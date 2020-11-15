const express = require("express");
const app = express();
const http = require("http").createServer(app);
const port = 3000;
const io = require("socket.io")(http);
const path = require("path");
let users = [];
let messages = []; // Need to be implemented later
let userCount = 0;
let userColor = "black";
let nameChange = false;
let nameExist = false;
let newUser = true;
let user_name = "kazi";

app.use(express.static(path.join(__dirname, "public")));


io.on("connection", (socket) => {
  userCount++;

  //Reset chat log on the first user connection
  if(userCount === 1){
    messages.splice(0,messages.length);
  }
  //Create user name for a new user
  for(let i = 0; i < users.length; i++){
    if(users[i].id === socket.id) {
      user_name = users[i].user_name;
      newUser = false;
      break;
    }
  }
    if(newUser === true) {
      user_name = "user" + (socket.id).toString();
      addUser(socket.id,user_name,userCount,userColor);
    }
  //display chat log if more than 2 people are connected
  if(userCount >= 2)
  {
  socket.emit("chatlog",messages);
  }

  //Update the user list
  io.emit("updateUserList", users);

  //Welcome the user and let everyone know a new user has connected.
  socket.emit("chat message", socket.id, createFullMessage(socket.id,"Server",`Welcome ${user_name}`));
  socket.broadcast.emit('chat message', socket.id, createFullMessage(socket.id,"Server", `${user_name} has connected`));

  //When received a message, check the message for a username change request, then check for emojis, and send message to all clients
  socket.on('chat message', (msg) => {
  msg = checkMessageForName(socket.id, msg);
  if(nameExist === true) {
    socket.emit("chat message", socket.id,createFullMessage(socket.id,"Server","username already exists"));
    nameExist = false;
    msg = "My username change request failed";
  }
  msg = checkMessageForEmojis(msg);
  checkMessageForColor(msg);
  io.emit("chat message", socket.id, createFullMessage(socket.id,user_name,msg));
 });

 //If client disconnects, remove the user from the list, update the user list
 socket.on('disconnect', () => {
   console.log('user disconnected');
   userCount--;
   removeUser(socket.id);

 });
});

//listen for a connection
http.listen(port, () => {
  console.log("listening on "+ port);
});

//Add user to the users list
function addUser(id,user_name,userCount,userColor){
  let newUser = {id, user_name,userCount,userColor};
  users.push(newUser);
}

//remove user from the user list
function removeUser(socketid){
  for(let i = 0; i < users.length; i++){
    if(users[i].id === socketid ) {
      let uname = users[i].user_name;
      users.splice(i,1);
      io.emit("chat message", socketid, createFullMessage(socketid,"Server",`${uname} has disconnected`));
      io.emit("updateUserList", users);
    }
  }
}

//Check the message for username change request, and if true, change the username, update the user list
function checkMessageForName(id, msg){
  let index = 0;
  let un = "";
  let nameLength = "/name".length;
  index = msg.search("/name");
  console.log(index);
  if(index > -1) {
    un = msg.substring(index + nameLength,msg.length);
    changeUserName(id,un);
    if(nameChange === true){
    return `I changed my username to ${un}`;
    nameChange = false;
    }
    else {
      return msg;
    }
  }
  else {
    return msg;
  }
}

//Create full message with username and time stamp
function createFullMessage(sid,user_nam, msg){
  if(user_nam != "Server") {
    for(let i = 0; i < users.length; i++){
      if(users[i].id === sid){
        user_nam = users[i].user_name;
        break;
      }
    }
  }
  let dat = new Date();
  let dt = dat.getHours() + ":" + dat.getMinutes();
  let mesg = user_nam + ": " + msg + " (" + dt + ")";
  let newmsg = {sid,user_nam,mesg};
  messages.push(newmsg);
  return mesg;
}

//Change user name
function changeUserName(sckid, un){

  for (let ind = 0; ind < users.length; ind++) {
    if(users[ind].user_name === un) {
      nameExist = true;
      break;
    }
  }
  if(nameExist === false) {
    for(let i = 0; i < users.length; i++){
      if(users[i].id === sckid){
        users[i].user_name = un;
        user_name = un;
        nameChange = true;
        io.emit("updateUserList", users);
      }
    }
  }

}

//Check message for color
function checkMessageForColor(msg){
  let index = 0;
  let color = "";
  let colorLength = "/color".length;
  index = msg.search("/color");

  if(index > -1) {
    color = msg.substring(index + colorLength,msg.length);
  }
}

function checkMessageForEmojis(msg) {
  let index = 0;
  index = msg.indexOf(":)");
  if(((msg.indexOf(":)")) > -1) || ((msg.indexOf(":(")) > -1) || ((msg.indexOf(":o")) > -1)) {

    if(((msg.indexOf(":)")) > -1)) {
      msg = msg.replace(":)", "😃" );
    }

    if(((msg.indexOf(":(")) > -1)) {
      msg = msg.replace(":(", "😞" );
    }

    if(((msg.indexOf(":o")) > -1)) {
      msg = msg.replace(":o", "😲" );
    }

  }
  return msg;

}
