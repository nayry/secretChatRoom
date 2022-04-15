const io = require('socket.io')({
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
  });
const { makeid } = require('./utils');

const clientRooms = {};

io.on('connection', client => {
    client.on("newChat", handleNewChat);
    client.on("joinChat", (roomName) => handleJoinChat(roomName));
    client.on("newText", (roomName, text) => handleNewText(roomName, text));
    function handleNewChat() {
        let roomName = makeid(5);
        client.join(roomName);
        console.log("joining!!!");
        clientRooms[roomName] = {roomName, clients: [client.id]};
        clientRooms[roomName] = {...clientRooms[roomName], history: [{id: client.id, message: "First user has joined!"}]};
        client.emit("start", JSON.stringify(clientRooms[roomName]));
      }

    function handleJoinChat(roomName) {
        for (const [key] of Object.entries(clientRooms)) {
            if (key === roomName) {
                client.join(roomName);
                clientRooms[roomName].clients.push(client.id);
                clientRooms[roomName].history.push({id: client.id, message: `User No.${clientRooms[roomName].clients.length} joined!`});
            }
        }
        client.to(roomName).emit("newMessage", JSON.stringify(clientRooms[roomName]));
        client.emit("joined", JSON.stringify(clientRooms[roomName]));
        console.log(roomName);
    }

    function handleNewText(roomName, text) {
        for (const [key] of Object.entries(clientRooms)) {
            if (key === roomName) {
                clientRooms[roomName].history.push({id: client.id, message: text});
            }
        }
        client.to(roomName).emit("newMessage", JSON.stringify(clientRooms[roomName]));
        client.emit("newMessage", JSON.stringify(clientRooms[roomName]));
    }

});

io.listen(process.env.PORT || 5000);
