const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
let users = [];
let connections = [];

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`App Started, Listening on port ${port} !!!`);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.sockets.on("connection", socket => {
  console.log(socket.id);
  connections.push(socket);
  console.log(`Connected: ${connections.length} sockets connected`);
  //Disconnect
  socket.on("disconnect", socket => {
    if (socket.username) return;
    users.splice(users.indexOf(socket.username), 1);
    updateUserNames();
    connections.splice(connections.indexOf(socket), 1);
    console.log(`Disconected : ${connections.length} sockets connected`);
  });
  // Send message
  socket.on("send message", data => {
    io.sockets.emit("new message", { msg: data, user: socket.username });
  });

  socket.on("new user", (data, callback) => {
    callback(true);
    socket.username = data;
    users.push(socket.username);
    updateUserNames();
  });

  socket.on("private message", data => {
    console.log("private message");
    socket
      .to(socket.id)
      .emit("private message", { msg: data, user: "Private" });
    socket.emit("private message", { msg: data, user: "Private" });
  });

  function updateUserNames() {
    io.sockets.emit("get users", users);
  }
});
