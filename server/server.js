require('dotenv').config();

console.log('Verificare variabile mediu:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Setat' : '✗ Lipsă');
console.log('PORT:', process.env.PORT);



const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const connectDB = require("./database/connect");
const Message = require("./models/Message");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Conectare la MongoDB
connectDB();

// Ca să putem citi JSON în POST
app.use(express.json());

// ======================
// RUTA LOGIN
// ======================
app.post("/login", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.json({ success: false, message: "Username lipsă" });

  try {
    let user = await User.findOne({ username });
    if (!user) user = await User.create({ username });

    res.json({ success: true, username: user.username });
  } catch (err) {
    console.error("Eroare login:", err);
    res.json({ success: false, message: "Eroare server" });
  }
});

// Servește frontend-ul
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// ======================
// WebSocket
// ======================
const clients = new Set();

wss.on("connection", async (ws) => {
  console.log("Client conectat");
  clients.add(ws);

  ws.send(JSON.stringify({
    type: "system",
    message: "Conectat la server!",
    timestamp: new Date().toISOString(),
  }));

  const oldMessages = await Message.find().sort({ timestamp: 1 }).limit(50);
  oldMessages.forEach((m) => ws.send(JSON.stringify({
    type: "message",
    username: m.username,
    message: m.message,
    timestamp: m.timestamp,
  })));

  ws.on("message", async (data) => {
    try {
      const msg = JSON.parse(data);

      let user = await User.findOne({ username: msg.username });
      if (!user) user = await User.create({ username: msg.username });

      const newMessage = await Message.create({
        username: msg.username,
        message: msg.message,
      });

      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "message",
            username: newMessage.username,
            message: newMessage.message,
            timestamp: newMessage.timestamp,
          }));
        }
      });
    } catch (err) {
      console.error("Eroare mesaj:", err);
    }
  });

  ws.on("close", () => {
    console.log("Client deconectat");
    clients.delete(ws);
  });

  ws.on("error", (err) => console.error("Eroare WebSocket:", err));
});

const PORT = process.env.PORT || 3001;
   server.listen(PORT, "0.0.0.0", () => {
  //temporar:
  // server.listen(PORT, "localhost", () => {
    
  console.log(`🚀 Server pornit pe portul ${PORT}`);
});


