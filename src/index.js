const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io'); // Support for socket.io
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server); // Create new socketio instance passing the http server in

// Create port
const port = process.env.PORT || 3000;
// Define path for express config
const publicPath = path.join(__dirname, '../public');

// Setup static directory to serve
app.use(express.static(publicPath));

//// COUNTER EXAMPLE
//let count = 0;

// This will be executed when new client connects
io.on('connection', (socket) => {
  console.log('New WebSocket Connection');

  // Client disconnected
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage('Admin', `${user.username} has left!`)
      );

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  // Listen for 'join' from client to join user to a chat room
  socket.on('join', (options, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      ...options,
    });

    if (error) {
      return callback(error);
    }

    // create a new room
    socket.join(user.room);

    //// GREETING
    // Send an event to clients for the first connection only
    socket.emit('message', generateMessage('Admin', 'Welcome!'));
    // broadcast that a user has joined
    socket.broadcast
      .to(user.room)
      .emit('message', generateMessage('Admin', `${user.username} has joined`));

    // Emit data for user chat room list
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  //// SEND MESSAGES CHALLENGE
  socket.on('sendMessage', (msg, callback) => {
    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback('Profanity is not allowed!');
    }

    const user = getUser(socket.id);

    // send an event to all clients
    io.to(user.room).emit('message', generateMessage(user.username, msg));

    // acknowledge
    callback();
  });

  //// Geolocation
  socket.on('sendLocation', (location, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(user.username, location)
    );

    // acknowledge
    callback();
  });
});

// -----------------------------------------------

// Server port listener
server.listen(port, () => {
  console.log(`Server is up on port: ${port}`);
});
