io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    // Guardar un nombre temporal por defecto
    socket.data.username = "Anónimo";

    // Cuando un usuario se une con su nombre personalizado
    socket.on("join-room", (username) => {
        if (username) socket.data.username = username;
        
        // Enviar lista de usuarios actuales con sus nombres a los demás
        const usersInRoom = [];
        for (let [id, sock] of io.of("/").sockets) {
            if (id !== socket.id) {
                usersInRoom.push({ id, username: sock.data.username });
            }
        }
        socket.emit("existing-users", usersInRoom);

        // Notificar a todos que un nuevo usuario se unió
        socket.broadcast.emit("user-joined", { id: socket.id, username: socket.data.username });
    });

    // Manejar el chat de texto general
    socket.on("chat-message", (message) => {
        io.emit("chat-message", { sender: socket.data.username, message });
    });

    // Señalización WebRTC (ofertas, respuestas y candidatos ICE)
    socket.on("offer", ({ to, offer }) => {
        io.to(to).emit("offer", { from: socket.id, offer });
    });

    socket.on("answer", ({ to, answer }) => {
        io.to(to).emit("answer", { from: socket.id, answer });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
        io.to(to).emit("ice-candidate", { from: socket.id, candidate });
    });

    // Desconexión
    socket.on("disconnect", () => {
        io.emit("user-left", socket.id);
        console.log("Usuario desconectado:", socket.id);
    });
});
