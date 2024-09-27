// left section names
const displayName = document.getElementsByClassName("welcome-msg")[0];
const chatSection = document.getElementsByClassName("chat-section")[0];
const InputMsgBox = document.getElementsByClassName("chat-message")[0];
const sendMsgBtn = document.getElementsByClassName("send-message-btn")[0];

const socket = io.connect("http://localhost:3000/");

const userName = document.getElementById("user-name");
const RoomCode = document.getElementById("room-code");
const EnterRoomButton = document.getElementById("enter-room");
let currentUser;
EnterRoomButton.addEventListener("click", () => {
  const username = userName.value;
  const roomcode = RoomCode.value;
  if (username == "" || roomcode == "") {
    alert("Please fill mandatory fields");
  } else {
    currentUser = username;
    const userData = {
      username: username,
      roomcode: roomcode,
    };
    const welcomeMsg = document.createElement("div");
    welcomeMsg.classList.add("welcome-msg-div");
    welcomeMsg.innerHTML = `<i class="fas fa-circle" style="color: green;"></i> <p>Welcome ${username}</p>`;
    displayName.appendChild(welcomeMsg);
    socket.emit("join", userData);
  }
  console.log(`User name: ${username} ${roomcode}`);
  userName.value = "";
  roomcode.value = "";
});

//Setting up left section

sendMsgBtn.addEventListener("click", () => {
  const enteredMessage = InputMsgBox.value;
  console.log("current User is:", currentUser);
  console.log("The enterd message is",enteredMessage);
  const data = {
    message: enteredMessage,
    username: currentUser,
  };
  socket.emit("send-message", data);
  //displaying Current Msg
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = `${hours}:${minutes}`;
  const newMessage = document.createElement("div");
  newMessage.classList.add("message-container");
  newMessage.innerHTML = `<p class="msg-header">${currentUser} ${currentTime}</p><p class="msg-text">${enteredMessage}</p>`;
  chatSection.appendChild(newMessage);
  InputMsgBox.value = "";
});

//Loading messages from database and displaying them
socket.on("perviousMessages", async (data) => {
  data &&
    data.forEach((element) => {
      // console.log(element);
      if (element.username == currentUser) {
        const newMessage = document.createElement("div");
        newMessage.classList.add("message-container");
        newMessage.innerHTML = `<p class="msg-header">${currentUser} ${element.time}</p><p class="msg-text">${element.message}</p>`;
        chatSection.appendChild(newMessage);
      } else {
        const newMessage = document.createElement("div");
        newMessage.classList.add("message-container-other");
        newMessage.innerHTML = `<p class="msg-header-other">${element.username} ${element.time}</p><p class="msg-text-other">${element.message}</p>`;
        chatSection.appendChild(newMessage);
      }
    });
});

//displaying message when other joins
socket.on("other-join",(msg)=>{
  console.log("inside join data other", msg);
  const newJoin = document.createElement("div");
    newJoin.classList.add("message-container-other");
    newJoin.innerHTML = `<p class="msg-new-join">${msg} Joined chat</p>`;
    chatSection.appendChild(newJoin);
});

socket.on("disconnect-member",(msg)=>{
  console.log("inside leave data other", msg);
  const newJoin = document.createElement("div");
    newJoin.classList.add("message-container-other");
    newJoin.innerHTML = `<p class="msg-new-join">${msg} leave the chat</p>`;
    chatSection.appendChild(newJoin);
});

//displaying All avaiable members
socket.on("all-members",(data)=>{
  console.log(data);
  const onlineUsers = Object.values(data);

  const allUsers = document.getElementById("connected-users-list");
  const usersCount = document.getElementsByClassName("connected-users-count")[0];
  usersCount.innerText = "";  
  const countDiv = document.createElement("div");
  countDiv.innerHTML = `<p>Current Active users: ${onlineUsers.length}</p>`;
  usersCount.appendChild(countDiv);
  allUsers.innerText ="";
  
  console.log(onlineUsers);
  onlineUsers && onlineUsers.forEach((user)=>{
    const members = document.createElement("div");
    members.classList.add("connected-users-count");
    members.innerHTML = `<p>${user}</p>`;
    allUsers.appendChild(members);
  })
})

//displaying message to other users
socket.on("server-message", (data) => {
  console.log("received server data", data);

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = `${hours}:${minutes}`;
  
  const newMessage = document.createElement("div");
  newMessage.classList.add("message-container-other");
  newMessage.innerHTML = `<p class="msg-header-other">${data.username} ${currentTime}</p><p class="msg-text-other">${data.message}</p>`;
  chatSection.appendChild(newMessage);
});


//typing logic

InputMsgBox.addEventListener("focus",(e)=>{
  console.log(e);
  const msg ="Typing";
  socket.emit("typing",msg);
})

let typingTimeout;
socket.on("userTyping",(data)=>{
  const existingTypingMsg = document.querySelector(".typing-msg-div");
  if (existingTypingMsg) {
    existingTypingMsg.remove();
  }

  const typingMsg = document.createElement("div");
  typingMsg.classList.add("typing-msg-div");
  typingMsg.innerHTML = `<p>${currentUser} Typing...</p>`;
  displayName.appendChild(typingMsg);

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typingMsg.remove();
  }, 3000);
})