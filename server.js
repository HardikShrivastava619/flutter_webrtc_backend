const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {

  // Register user
  socket.on("register", ({ userId }) => {
    onlineUsers.set(userId, socket.id);
    console.log("User connected:", userId);
  });

  // WebRTC Offer
  socket.on("webrtc-offer", ({ to, offer, uid }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("incoming-call", {
        from: uid,
        offer,
      });
    }
  });

  // WebRTC Answer
  socket.on("webrtc-answer", ({ to, answer }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("webrtc-answer", { answer });
    }
  });

  // ICE Candidate
  socket.on("webrtc-candidate", ({ to, candidate }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("webrtc-candidate", { candidate });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) onlineUsers.delete(key);
    });
  });
});

const PORT = process.env.PORT || 2001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
