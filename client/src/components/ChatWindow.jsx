import React, { useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import Avatar from "./Avatar";
import { Wifi, WifiOff, LogOut, Trash2 } from "lucide-react";

export default function ChatWindow({ username }) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastClearAt, setLastClearAt] = useState(() => {
    const saved = localStorage.getItem("lastClearAt");
    return saved ? new Date(saved) : new Date(0);
  });
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("wss://sopm-25-chat.onrender.com");

    ws.current.onopen = () => setIsConnected(true);
    ws.current.onclose = () => setIsConnected(false);
    ws.current.onerror = (err) => console.error("WebSocket error:", err);

    ws.current.onmessage = (event) => {
      // Log raw incoming data for debugging
      console.log("WebSocket raw data:", event.data, "(type:", typeof event.data, ")");

      let data;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        console.error("Failed to JSON.parse WebSocket message:", err, "raw:", event.data);
        return;
      }

      console.log("WebSocket message received:", data);

      // Gestionare clear event
      if (data && data.type === "clear") {
        console.log("Clear event received. Timestamp:", data.timestamp);
        const clearTime = new Date(data.timestamp);
        console.log("clearTime Date object:", clearTime);
        setLastClearAt(clearTime);
        try {
          localStorage.setItem("lastClearAt", clearTime.toISOString());
        } catch (e) {
          console.warn("Could not save lastClearAt to localStorage:", e);
        }
        console.log("lastClearAt set to:", clearTime.toISOString());
        return;
      }

      // Mesaje normale - defensive: ensure timestamp exists
      if (data) {
        if (!data.timestamp) {
          data.timestamp = new Date().toISOString();
          console.warn("Incoming message missing timestamp — assigning now:", data.timestamp);
        }
        console.log("Adding message. Message timestamp:", data.timestamp);
        setMessages((prev) => [...prev, data]);
      }
    };

    return () => ws.current?.close();
  }, []);

  const sendMessage = (text) => {
    ws.current?.send(
      JSON.stringify({
        username,
        message: text,
      })
    );
  };

  const logout = () => {
    ws.current?.close();
    window.location.reload();
  };

  const clearChat = () => {
    if (!confirm("Ștergi afișarea chat-ului? (mesajele rămân în baza de date)")) {
      return;
    }
    console.log("Sending clear event...");
    ws.current?.send(
      JSON.stringify({
        username,
        type: "clear",
      })
    );
  };

  // Filtrează mesajele să afișeze doar pe cele primite după clear
  const visibleMessages = messages.filter((m) => {
    if (m.type === "clear") return false;
    if (!m.timestamp) return true;
    const msgDate = new Date(m.timestamp);
    const isVisible = msgDate >= lastClearAt;
    console.log(`Filter check - Message: ${m.message || m.content}, timestamp: ${m.timestamp}, msgDate: ${msgDate}, lastClearAt: ${lastClearAt}, visible: ${isVisible}`);
    return isVisible;
  });

  return (
    <div className="chat-page">
      <div className="chat-card">
        <header className="chat-header">
          <div className="chat-header-left">
            <Avatar username={username} size={44} />
            <h1>Chat Room</h1>
            <div className="chat-status">
              {isConnected ? <Wifi /> : <WifiOff />}
            </div>
          </div>

          <div className="chat-header-right">
            <div className="username-badge">{username}</div>
            <button 
              className="clear-btn" 
              onClick={clearChat}
              title="Clear chat display"
            >
              <Trash2 />
            </button>
            <button className="logout-btn" onClick={logout}>
              <LogOut />
            </button>
          </div>
        </header>

        <MessageList messages={visibleMessages} username={username} />
        <MessageInput onSend={sendMessage} disabled={!isConnected} />
      </div>
    </div>
  );
}
