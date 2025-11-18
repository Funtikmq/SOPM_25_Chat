const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// Servește fișierele static buildate de Vite
app.use(express.static(path.join(__dirname, "../client/dist")));

// ✅ CORECT - folosește "/*" în loc de "*"
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Stocare clienți conectați
const clients = new Set();

wss.on("connection", (ws) => {
  console.log("Client nou conectat");
  clients.add(ws);

  // Trimite mesaj de bun venit
  ws.send(
    JSON.stringify({
      type: "system",
      message: "Conectat la server!",
      timestamp: new Date().toISOString(),
    })
  );

  // Ascultă mesaje de la client
  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data);
      console.log("Mesaj primit:", message);

      // Broadcast mesajul către toți clienții conectați
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "message",
              username: message.username || "Anonim",
              message: message.message,
              timestamp: new Date().toISOString(),
            })
          );
        }
      });
    } catch (error) {
      console.error("Eroare parsare mesaj:", error);
    }
  });

  // Gestionare deconectare
  ws.on("close", () => {
    console.log("Client deconectat");
    clients.delete(ws);

    // Anunță ceilalți utilizatori
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "system",
            message: "Un utilizator s-a deconectat",
            timestamp: new Date().toISOString(),
          })
        );
      }
    });
  });

  ws.on("error", (error) => {
    console.error("Eroare WebSocket:", error);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server pornit pe portul ${PORT}`);
  console.log(`📱 Aplicația este accesibilă la: http://localhost:${PORT}`);
});
