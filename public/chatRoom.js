const clientSocket = io();
const chat = document.getElementById("chatBox");
const display = document.getElementById("messages");
const chatSpace = document.getElementById("chatSpace");
const userList = document.getElementById("usernames");
const userColr = "Black";
clientSocket.on("chat message", (id,msg) => {
  displayMessage(id, msg);
  chatSpace.scrollTop = chatSpace.scrollHeight;
});

clientSocket.on("updateUserList", (users) => {
  updateList(users);
});

clientSocket.on("chatlog", (messages) => {
  displayLog(messages);
});
//Send message
chat.addEventListener("submit", (evt) => {
  evt.preventDefault(); //stop submission to files
  const chatMsg = evt.target.elements.clientMessage.value;
  console.log(chatMsg);
  clientSocket.emit("chat message", chatMsg);
  evt.target.elements.clientMessage.value= "";
  evt.target.elements.clientMessage.focus();

});

//Display message
function displayMessage(id,msg) {
  let item = document.createElement("LI");
  item.appendChild(document.createTextNode(msg));
  if(id === clientSocket.id) {
    item.style.fontWeight = "bold";
  }
  display.appendChild(item);
}

function updateList(users){
  userList.innerHTML = "";
  let head = document.createElement("H1")
  let headNode = document.createTextNode("User Online");
  head.appendChild(headNode);
  userList.appendChild(head);
  for(let i = 0; i < users.length; i++){
    let item = document.createElement("LI");
    item.appendChild(document.createTextNode(users[i].user_name));
    item.style.fontWeight = "bold";
    userList.appendChild(item);
  }
}

function displayLog(messages) {
  for(let i = messages.length - 1; i >  0; i--) {
    let item = document.createElement("LI");
    item.appendChild(document.createTextNode(messages[i].mesg));
    display.appendChild(item);
  }
}
