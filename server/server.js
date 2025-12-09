require("dotenv").config();

const crypto = require("crypto");

console.log("Verificare variabile mediu:");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✓ Setat" : "✗ Lipsă");
console.log("PORT:", process.env.PORT);

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

app.use(express.json());

// ======================
// RUTA LOGIN
// ======================
app.post("/login", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.json({ success: false, message: "Username lipsă" });

  try {
    let user = await User.findOne({ username });
    if (!user) {
      user = await User.create({
        username,
        sessionId: crypto.randomUUID(),
      });
    }

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

  ws.send(
    JSON.stringify({
      type: "system",
      message: "Conectat la server!",
      timestamp: new Date().toISOString(),
    })
  );

  const oldMessages = await Message.find().sort({ timestamp: 1 }).limit(50);
  oldMessages.forEach((m) =>
    ws.send(
      JSON.stringify({
        type: "message",
        username: m.username,
        message: m.content,
        timestamp: m.timestamp,
      })
    )
  );

  ws.on("message", async (data) => {
    try {
      console.log("Raw WS message incoming (raw):", data);
      const msg = JSON.parse(data);

      // Găsește sau creează userul
      let user = await User.findOne({ username: msg.username });
      if (!user) {
        user = await User.create({
          username: msg.username,
          sessionId: crypto.randomUUID(),
        });
      }

      // Gestionare CLEAR event
      if (msg.type === "clear") {
        console.log("Clear event received from:", msg.username);
        user.lastClearAt = new Date();
        await user.save();
        console.log("User lastClearAt updated to:", user.lastClearAt);
        
        // Notifică toți clienții despre clear
        console.log("Broadcasting clear event to", clients.size, "clients");
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "clear",
                username: msg.username,
                timestamp: user.lastClearAt.toISOString(),
              })
            );
          }
        });
        return;
      }

      // Mesaj normal
      // Creează mesajul respectând schema
      const newMessage = await Message.create({
        content: msg.message,
        userId: user._id,
        username: msg.username,
      });

      // Prepare payload and log for debugging
      const payload = {
        type: "message",
        username: newMessage.username,
        message: newMessage.content,
        timestamp: newMessage.timestamp.toISOString(),
      };
      console.log("Broadcasting message:", payload);

      // Trimite mesajul către toți clienții
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(payload));
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
