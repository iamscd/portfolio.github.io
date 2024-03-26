const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = 5000;
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);

});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server);

//we use a set to store users, sets objects are for unique values of any type
const activeUsers = new Set();

io.on("connection", function (socket) {
  console.log("Made socket connection");

  socket.on("new user", function (data) {
    socket.userId = data;
    activeUsers.add(data);
    //... is the the spread operator, adds to the set while retaining what was in there already
    io.emit("new user", [...activeUsers]);
  });

  socket.on("disconnect", function () {
      activeUsers.delete(socket.userId);
      io.emit("user disconnected", socket.userId);
    });

    socket.on("chat message", function (data) {
      io.emit("chat message", data);
  });

});

// Assuming the rest of your existing validation script is intact, add to your script

// Select the form and other elements
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Form data to be sent
  let formData = {
    name: contactForm['name'].value,
    email: contactForm['email'].value,
    message: contactForm['message'].value
  };
  
  // Here you would typically send the formData to the server
  // For demonstration, we'll just log it to the console
  console.log(formData);

  // Reset the form after submission
  contactForm.reset();
  
  // Optionally, show a success message or handle the response
});
