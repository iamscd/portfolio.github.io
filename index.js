const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = 3000;
const app = express();
const server = app.listen(PORT, function () {
    console.log(`^Listening on port ${PORT}`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = require("socket.io")(server);

// Set to store active users
const activeUsers = new Set();

// Event listener for new connections
io.on("connection", function (socket) {
    console.log("Made socket connection");

    socket.on("new user", function (data) {
        socket.userId = data;
        activeUsers.add(data);
        io.emit("new user", [...activeUsers]);
    });

    socket.on("disconnect", function () {
        if (socket.userId) {
            const userName = socket.userId;
            activeUsers.delete(userName);
            io.emit("user disconnected", userName);
        }
    });

    // Event listener for chat messages
    socket.on("chat message", function (data) {
        io.emit("chat message", data);
    });

    // Listen for typing event from client
    socket.on("typing", (data) => {
        socket.broadcast.emit("typing", { userName: data.userName });
    });

    // Listen for stop typing event from client
    socket.on("stop typing", (data) => {
        socket.broadcast.emit("stop typing", { userName: data.userName });
    });

});