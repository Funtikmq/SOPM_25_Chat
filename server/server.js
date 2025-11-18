const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Servește fișierele static buildate
app.use(express.static(path.join(__dirname, "../client/dist")));

// Ruta pentru SPA - folosește approach-ul safe
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Pentru orice altă rută, redirecționează către index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// WebSocket logic
const clients = new Set();

wss.on("connection", (ws) => {
  console.log("Client nou conectat");
  clients.add(ws);

  ws.send(
    JSON.stringify({
      type: "system",
      message: "Conectat la server!",
      timestamp: new Date().toISOString(),
    })
  );

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data);

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

  ws.on("close", () => {
    console.log("Client deconectat");
    clients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("Eroare WebSocket:", error);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server pornit pe portul ${PORT}`);
});
