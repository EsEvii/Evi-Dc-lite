const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado:', socket.id);

  socket.on('join-room', (roomID, userID) => {
    socket.join(roomID);
    socket.to(roomID).emit('user-connected', userID);

    // Reenviar oferta WebRTC
    socket.on('offer', (roomID, targetID, offer) => {
      socket.to(targetID).emit('offer', userID, offer);
    });

    // Reenviar respuesta WebRTC
    socket.on('answer', (roomID, targetID, answer) => {
      socket.to(targetID).emit('answer', userID, answer);
    });

    // Reenviar candidatos ICE de red
    socket.on('ice-candidate', (roomID, targetID, candidate) => {
      socket.to(targetID).emit('ice-candidate', userID, candidate);
    });

    socket.on('disconnect', () => {
      socket.to(roomID).emit('user-disconnected', userID);
      console.log('Usuario desconectado:', userID);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor de señalización corriendo en el puerto ${PORT}`);
});