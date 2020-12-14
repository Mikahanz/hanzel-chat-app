const users = [];

//// addUser
const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data.
  if (!username || !room) {
    return {
      error: 'Username and Room are required!',
    };
  }

  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: 'Username is in use!',
    };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

////  removeUser
const removeUser = (id) => {
  // Find the index no of user with that id no
  const index = users.findIndex((user) => user.id === id);

  // Verify if uses exists, if yes - remove that user and
  //    return the user that has been removed
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//// getUser
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

//// getUsersInRoom
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
