import React, { useState, useEffect, useRef } from "react";
import { Send, User, Wifi, WifiOff, LogOut } from "lucide-react";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [hasUsername, setHasUsername] = useState(false);
  const [serverIP, setServerIP] = useState("localhost:3001");
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (hasUsername) {
      ws.current = new WebSocket("wss://sopm-25-chat.onrender.com");

      ws.current.onopen = () => setIsConnected(true);
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      };
      ws.current.onclose = () => setIsConnected(false);
      ws.current.onerror = (err) => console.error("WebSocket error:", err);

      return () => ws.current?.close();
    }
  }, [hasUsername, serverIP]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim() && ws.current && isConnected) {
      ws.current.send(JSON.stringify({ username, message: inputMessage }));
      setInputMessage("");
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  const handleUsernameSubmit = () => {
    if (username.trim() && serverIP.trim()) setHasUsername(true);
  };

  const handleLogout = () => {
    ws.current?.close();
    setHasUsername(false);
    setMessages([]);
    setIsConnected(false);
  };

  if (!hasUsername) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-icon">
            <User />
          </div>
          <h1>Bine ai venit!</h1>
          <p>Introdu datele pentru a intra în chat</p>

          <label>Adresa Server</label>
          <input
            type="text"
            value={serverIP}
            onChange={(e) => setServerIP(e.target.value)}
            placeholder="ex: 192.168.1.100:3001"
            className="login-input"
          />

          <label>Numele tău</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleUsernameSubmit)}
            placeholder="Introdu numele..."
            maxLength={20}
            className="login-input"
          />

          <button className="login-button" onClick={handleUsernameSubmit}>
            Intră în chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-card">
        <header className="chat-header">
          <div className="chat-header-left">
            <div className="chat-user-icon">
              <User />
            </div>
            <div>
              <h1>Chat Room</h1>
              <div className="chat-status">
                {isConnected ? (
                  <>
                    <Wifi className="status-icon" />
                    <span>Conectat</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="status-icon" />
                    <span>Deconectat</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="chat-header-right">
            <div className="username-badge">{username}</div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut />
            </button>
          </div>
        </header>

        <main className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <div className="emoji">💬</div>
              <p className="primary">Niciun mesaj încă...</p>
              <p className="secondary">Fii primul care trimite un mesaj!</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`message-wrapper ${
                  msg.type === "system"
                    ? "center"
                    : msg.username === username
                    ? "right"
                    : "left"
                }`}
              >
                {msg.type === "system" ? (
                  <div className="system-message">{msg.message}</div>
                ) : (
                  <div
                    className={`chat-message ${
                      msg.username === username ? "mine" : "theirs"
                    }`}
                  >
                    <div className="message-username">{msg.username}</div>
                    <div className="message-text">{msg.message}</div>
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString("ro-RO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="chat-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, sendMessage)}
            placeholder="Scrie un mesaj..."
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected || !inputMessage.trim()}
          >
            <Send />
            Trimite
          </button>
        </footer>
      </div>
    </div>
  );
}
