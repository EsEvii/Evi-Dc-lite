const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const roomID = "sala-amigos-123";

io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado:', socket.id);

  // Cuando un usuario se une a la sala
  socket.on('join-room', () => {
    socket.join(roomID);
    console.log(`Usuario ${socket.id} se unió a la sala ${roomID}`);

    // Avisar a los demás en la sala que alguien nuevo entró
    socket.to(roomID).emit('user-joined', socket.id);

    // Enviar al nuevo usuario la lista de los que ya están en la sala
    const clientsInRoom = io.sockets.adapter.rooms.get(roomID);
    const users = clientsInRoom ? Array.from(clientsInRoom) : [];
    socket.emit('existing-users', users.filter(id => id !== socket.id));
  });

  // Reenviar oferta WebRTC
  socket.on('offer', ({ to, offer }) => {
    socket.to(to).emit('offer', { from: socket.id, offer });
  });

  // Reenviar respuesta WebRTC
  socket.on('answer', ({ to, answer }) => {
    socket.to(to).emit('answer', { from: socket.id, answer });
  });

  // Reenviar candidatos ICE de red
  socket.on('ice-candidate', ({ to, candidate }) => {
    socket.to(to).emit('ice-candidate', { from: socket.id, candidate });
  });

  // Manejar desconexiones
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    io.emit('user-left', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor de señalización corriendo en el puerto ${PORT}`);
});
