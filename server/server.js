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
        id: m._id,
        username: m.username,
        message: m.content,
        timestamp: m.timestamp,
        deleted: !!m.deleted,
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

      // CLEAR events are client-local only. Ignore clear requests on server to avoid
      // clearing the view for all connected clients.
      if (msg.type === "clear") {
        console.log("Received clear request from", msg.username, "— ignoring on server (local-only clear)");
        return;
      }

      // Handle delete request
      if (msg.type === "delete") {
        try {
          const messageId = msg.id;
          if (!messageId) {
            ws.send(JSON.stringify({ type: "error", message: "Missing message id for delete" }));
            return;
          }
          const m = await Message.findById(messageId);
          if (!m) {
            ws.send(JSON.stringify({ type: "error", message: "Message not found" }));
            return;
          }
          // Allow delete only by original author
          if (m.username !== msg.username) {
            ws.send(JSON.stringify({ type: "error", message: "Nu ai dreptul sa stergi acest mesaj" }));
            return;
          }

          m.deleted = true;
          m.deletedAt = new Date();
          m.deletedBy = msg.username;
          await m.save();

          // Broadcast delete event to all clients
          const payload = {
            type: "delete",
            id: m._id,
            deletedBy: m.deletedBy,
            deletedAt: m.deletedAt.toISOString(),
          };
          console.log("Broadcasting delete:", payload);
          clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(payload));
            }
          });
        } catch (err) {
          console.error("Error handling delete:", err);
          ws.send(JSON.stringify({ type: "error", message: "Eroare stergere mesaj" }));
        }
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
        id: newMessage._id,
        username: newMessage.username,
        message: newMessage.content,
        timestamp: newMessage.timestamp.toISOString(),
        deleted: false,
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
