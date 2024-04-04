const socket = io();

let isTypingMessageDisplayed = false;
const inboxPeople = document.querySelector(".inbox__people");
const userCountElement = document.getElementById("userCount");
const usersTyping = new Set();
let typingTimer;


let userName = "";

// Function to handle new user joining
const newUserConnected = function (username) {
    userName = username;
    socket.emit("new user", userName);
    addToUsersBox(userName);
    sendNotification(`${username} has joined the chat.`);
};

// Function to add user to the user list
const addToUsersBox = function (userName) {
    if (!!document.querySelector(`.${userName}-userlist`)) {
        return;
    }

    const userBox = `
    <div class="chat_id ${userName}-userlist">
      <h5>${userName}</h5>
    </div>`;

    inboxPeople.innerHTML += userBox;
    updateActiveUserCount();
};

// Function to scroll to the bottom of the page
const scrollToBottom = () => {
    const messageHistory = document.querySelector(".messages__history");
    messageHistory.scrollTop = messageHistory.scrollHeight;
};

// Keep track of the last message to prevent duplicates
let lastMessage = null;

// Event listener for receiving chat messages
socket.on("chat message", function (data) {
    // Check if the incoming message is the same as the last message
    if (lastMessage && lastMessage.user === data.nick && lastMessage.message === data.message) {
        return; // If it's the same, don't append it again
    }
    // Scroll to the bottom
    scrollToBottom();
});

// Function to update active user count
const updateActiveUserCount = function () {
    const activeUserCount = document.querySelectorAll(".inbox__people .chat_id").length;
    document.getElementById("userCount").textContent = activeUserCount; // Update the count here
};

// Function to send browser notification
const sendNotification = (message) => {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        new Notification(message);
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                new Notification(message);
            }
        });
    }
};

// Function to handle typing status
const handleTypingStatus = () => {
    const inputField = document.querySelector(".message_form__input");
    const isTyping = !!inputField.value.trim();

    if (isTyping) {
        socket.emit("typing", { userName: userName });
        clearTimeout(typingTimer); // Clear existing timer
    } else {
        socket.emit("stop typing", { userName: userName });
    }
};


// Event listener for form submission
document.querySelector(".message_form").addEventListener("submit", (e) => {
    e.preventDefault();
    const inputField = document.querySelector(".message_form__input");
    if (!inputField.value.trim()) {
        return;
    }

    socket.emit("chat message", {
        message: inputField.value,
        nick: userName,
    });

    inputField.value = "";
});

// Event  message", function (data) {
socket.on("chat message", function (data) {
    addNewMessage({ user: data.nick, message: data.message });
});

// Event listener for new user joining
socket.on("new user", function (data) {
    data.map(function (user) {
        return addToUsersBox(user);
    });
    if (data.includes(userName)) {
        addSystemMessage(`A user has joined the chat.`);
        sendNotification(`A user has joined the chat.`);
    } else {
        addSystemMessage(`${data[data.length - 1]} has joined the chat.`);
        sendNotification(`${data[data.length - 1]} has joined the chat.`);
    }
});

// Event listener for user disconnection
socket.on("user disconnected", function (userName) {
    document.querySelector(`.${userName}-userlist`).remove();
    updateActiveUserCount();
    addSystemMessage(`${userName} has left the chat.`);
    sendNotification(`${userName} has left the chat.`);
});

// Function to add new message to the chat history
const addNewMessage = ({ user, message }) => {
    const time = new Date();
    const formattedTime = time.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
    });

    const receivedMsg = `
    <div class="incoming__message">
        <div class="received__message">
            <p>${message}</p>
            <div class="message__info">
                <span class="message__author">${user}</span>
                <span class="time_date">${formattedTime}</span>
            </div>
        </div>
    </div>`;

    const myMsg = `
    <div class="outgoing__message">
        <div class="sent__message">
            <p>${message}</p>
            <div class="message__info">
                <span class="message__author">${userName}</span> <!-- Displaying user's name -->
                <span class="time_date">${formattedTime}</span>
            </div>
        </div>
    </div>`;

    const messageBox = document.querySelector(".messages__history");
    messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
    scrollToBottom();
};

// Function to add system message to the chat history
const addSystemMessage = (message) => {
    const time = new Date();
    const formattedTime = time.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
    });

    const systemMsg = `
    <div class="system__message">
        <p>${message}</p>
        <div class="message__info">
            <span class="time_date">${formattedTime}</span>
        </div>
    </div>`;

    const messageBox = document.querySelector(".messages__history");
    messageBox.innerHTML += systemMsg;
    scrollToBottom();
};

// Prompting user to input username
const promptForUsername = () => {
     const username = prompt("Please enter your username: (cannot only a number nor contain any symbols e.g. 12 , $%^)");
        if (username.trim()) {
        newUserConnected(username);
    } else {
        promptForUsername(); // If the username is empty, prompt again
    }
};

promptForUsername(); // Call the function to prompt for username when the page loads

// Event listener for user typing


document.querySelector(".message_form__input").addEventListener("input", () => {
    handleTypingStatus();
});

// Event listener for when user stops typing
document.querySelector(".message_form__input").addEventListener("blur", () => {
    handleTypingStatus();
});

// Listen for typing event from server
socket.on("typing", (data) => {
    showTypingMessage(data.userName);
    resetTypingTimer();
});

socket.on("stop typing", (data) => {
    typingUsers.delete(data.userName); // Remove user from the set
    updateTypingMessage();
    resetTypingTimer();
});

const updateTypingMessage = () => {
    const typingMessageElement = document.querySelector(".typing__message");
    const typingUsersArray = Array.from(typingUsers);
    let message = "";

    if (typingUsersArray.length === 1) {
        message = `${typingUsersArray[0]} is typing...`;
    } else if (typingUsersArray.length > 1) {
        message = "Multiple people are typing...";
    }

    typingMessageElement.innerHTML = message;
    typingMessageElement.style.display = message ? 'block' : 'none';
};


const resetTypingTimer = () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        hideTypingMessage(); // Call the function that hides the typing message
    }, 5000); // Set to 5 seconds
};


const removeTypingMessage = () => {
    const systemMessages = document.querySelectorAll('.system__message');
    if (systemMessages.length > 0) {
        // Assuming the last system message is the typing message
        const lastMessage = systemMessages[systemMessages.length - 1];
        if (lastMessage.innerText.includes('is typing...')) {
            lastMessage.remove();
        }
    }
};
document.querySelector(".message_form").addEventListener("submit", (e) => {
    // Existing code...
    
    // After sending the message
    if (isTypingMessageDisplayed) {
        removeTypingMessage();
        isTypingMessageDisplayed = false;
    }
});
let typingUsers = new Set();

const showTypingMessage = (userName) => {
    typingUsers.add(userName);
    let message;
    if (typingUsers.size === 1) {
        message = `${Array.from(typingUsers)[0]} is typing...`;
    } else {
        message = 'Multiple people are typing...';
    }

    const typingMessageElement = document.querySelector(".typing__message");
    typingMessageElement.innerHTML = `<p>${message}</p>`;
    typingMessageElement.style.display = 'block'; // Show the message
};